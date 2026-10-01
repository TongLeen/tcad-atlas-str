// Copyright 2026 TongLeen
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { mesh as _mesh } from "../core";

type UniformRefine = { range: [number, number]; spacing: number };
type InterfaceRefine = {
    location: number;
    value: number;
    factor: number;
    polar: "pos" | "neg" | "both";
};

const mesh = () => {
    const critical_lines_x: number[] = [];
    const critical_lines_y: number[] = [];
    const addCriticalLine = (axis: "x" | "y", location: number) => {
        if (axis === "x") {
            critical_lines_x.push(location);
        } else {
            critical_lines_y.push(location);
        }
    };

    const uniform_refine_x: UniformRefine[] = [];
    const uniform_refine_y: UniformRefine[] = [];
    const addUniformRefine = (
        axis: "x" | "y",
        { range, spacing }: UniformRefine,
    ) => {
        if (axis === "x") {
            uniform_refine_x.push({ range, spacing });
        } else {
            uniform_refine_y.push({ range, spacing });
        }
    };

    const interface_refine_x: InterfaceRefine[] = [];
    const interface_refine_y: InterfaceRefine[] = [];
    const addInterfaceRefine = (
        axis: "x" | "y",
        { location, value, factor, polar }: InterfaceRefine,
    ) => {
        if (axis === "x") {
            critical_lines_x.push(location);
            interface_refine_x.push({ location, value, factor, polar });
        } else {
            critical_lines_y.push(location);
            interface_refine_y.push({ location, value, factor, polar });
        }
    };
    const gen = () => {
        const sorted_critical_lines_x = critical_lines_x.sort((a, b) => a - b);
        const sorted_critical_lines_y = critical_lines_y.sort((a, b) => a - b);
        const sorted_uniform_refine_x = uniform_refine_x.sort(
            (a, b) => a.range[0] - b.range[0],
        );
        const sorted_uniform_refine_y = uniform_refine_y.sort(
            (a, b) => a.range[0] - b.range[0],
        );

        checkUniformRefineCoverAll(
            "x",
            sorted_uniform_refine_x,
            sorted_critical_lines_x,
        );
        checkUniformRefineCoverAll(
            "y",
            sorted_uniform_refine_y,
            sorted_critical_lines_y,
        );

        const x_uniform_refine_no_overlap = calculateUniformRefine(
            sorted_uniform_refine_x,
        );
        const y_uniform_refine_no_overlap = calculateUniformRefine(
            sorted_uniform_refine_y,
        );

        const interface_lines_x: number[] = [];
        const lines = calculateInterfaceLines(
            interface_refine_x,
            x_uniform_refine_no_overlap,
        );
        interface_lines_x.push(...lines);

        const interface_lines_y: number[] = [];
        const lines_y = calculateInterfaceLines(
            interface_refine_y,
            y_uniform_refine_no_overlap,
        );
        interface_lines_y.push(...lines_y);

        const sorted_final_lines_x = sortAndUnique([
            ...sorted_critical_lines_x,
            ...calculateUniformRefineBorderLine(x_uniform_refine_no_overlap, [
                ...sorted_critical_lines_x,
                ...interface_lines_x,
            ]),
            ...interface_lines_x,
        ]);
        const sorted_final_lines_y = sortAndUnique([
            ...sorted_critical_lines_y,
            ...calculateUniformRefineBorderLine(y_uniform_refine_no_overlap, [
                ...sorted_critical_lines_y,
                ...interface_lines_y,
            ]),
            ...interface_lines_y,
        ]);

        const { x, y, gen } = _mesh();
        for (const line of sorted_final_lines_x) {
            x(line, resolveSpacing(x_uniform_refine_no_overlap, line, "x"));
        }
        for (const line of sorted_final_lines_y) {
            y(line, resolveSpacing(y_uniform_refine_no_overlap, line, "y"));
        }
        return gen();
    };

    return {
        addCriticalLine,
        addUniformRefine,
        addInterfaceRefine,
        gen,
    };
};

export default mesh;

const checkUniformRefineCoverAll = (
    axis: "x" | "y",
    sorted_refines: UniformRefine[],
    sorted_critical_lines: number[],
) => {
    if (sorted_refines.length === 0)
        throw new Error("No uniform refine defined for " + axis);
    if (sorted_refines[0].range[0] > sorted_critical_lines[0])
        throw new Error(
            "Uniform refine does not cover first critical line for " +
                axis +
                ": " +
                sorted_refines[0].range[0] +
                " > " +
                sorted_critical_lines[0],
        );

    let current_tail = sorted_refines[0].range[1];
    for (let i = 0; i < sorted_refines.length - 1; i++) {
        if (current_tail < sorted_refines[i + 1].range[0])
            throw new Error(
                "Uniform refine range has no overlap for " +
                    axis +
                    ": " +
                    current_tail +
                    " < " +
                    sorted_refines[i + 1].range[0],
            );
        current_tail = Math.max(current_tail, sorted_refines[i + 1].range[1]);
    }
    if (current_tail < sorted_critical_lines[sorted_critical_lines.length - 1])
        throw new Error(
            "Uniform refine does not cover last critical line for " +
                axis +
                ": " +
                current_tail +
                " < " +
                sorted_critical_lines[sorted_critical_lines.length - 1],
        );
};

const calculateUniformRefine = (sorted_refines: UniformRefine[]) => {
    // assume sorted_refines are sorted by range[0] and cover all critical lines
    const allBorders = (() => {
        const sorted = sorted_refines.map((r) => r.range).flat();
        return [...new Set(sorted)].sort((a, b) => a - b);
    })();
    const range_bins: number[] = Array(allBorders.length - 1).fill(100);
    for (let i = 0; i < sorted_refines.length; i++) {
        const { range, spacing } = sorted_refines[i];
        for (let j = 0; j < range_bins.length; j++) {
            if (allBorders[j + 1] > range[0] && allBorders[j + 1] <= range[1]) {
                range_bins[j] = Math.min(range_bins[j], spacing);
            } else if (allBorders[j + 1] > range[1]) {
                break;
            }
        }
    }
    // 合并相同spacing的相邻区间
    const merged_refines: UniformRefine[] = [];
    let current_refine: UniformRefine = {
        range: [allBorders[0], allBorders[1]],
        spacing: range_bins[0],
    };
    for (let i = 1; i < range_bins.length; i++) {
        const next_spacing = range_bins[i];
        if (next_spacing === current_refine.spacing) {
            current_refine.range[1] = allBorders[i + 1];
        } else {
            merged_refines.push(current_refine);
            current_refine = {
                range: [allBorders[i], allBorders[i + 1]],
                spacing: next_spacing,
            };
        }
    }
    merged_refines.push(current_refine);
    return merged_refines;
};

const sortAndUnique = (arr: number[]): number[] => {
    const eps = 0.0001;
    const sorted = [...arr].sort((a, b) => a - b);
    const unique = sorted.filter(
        (a, i) => i === 0 || Math.abs(a - sorted[i - 1]) > eps,
    );
    return unique;
};

const findUniformRefine = (
    refines: UniformRefine[],
    location: number,
    polar: "neg" | "pos",
): UniformRefine | undefined => {
    if (polar === "neg") {
        for (const refine of refines) {
            if (location > refine.range[0] && location <= refine.range[1]) {
                return refine;
            }
        }
    } else {
        for (const refine of refines) {
            if (location >= refine.range[0] && location < refine.range[1]) {
                return refine;
            }
        }
    }
    return undefined;
};

const resolveSpacing = (
    refines: UniformRefine[],
    location: number,
    axis: "x" | "y",
): number => {
    const pos_refine = findUniformRefine(refines, location, "pos");
    const neg_refine = findUniformRefine(refines, location, "neg");
    if (!pos_refine && !neg_refine) {
        throw new Error(
            `No uniform refine covers the mesh line ${axis}=${location}`,
        );
    }
    if (!pos_refine) return neg_refine!.spacing;
    if (!neg_refine) return pos_refine!.spacing;
    return Math.max(pos_refine!.spacing, neg_refine!.spacing);
};

const calculateInterfaceLines = (
    interface_refine: InterfaceRefine[],
    uniform_refine_no_overlap: UniformRefine[],
): number[] => {
    const lines: number[] = [];
    for (const refine of interface_refine) {
        if (refine.polar === "both" || refine.polar === "pos") {
            const uni = findUniformRefine(
                uniform_refine_no_overlap,
                refine.location,
                "pos",
            );
            if (uni) {
                let s = refine.value;
                let l = refine.location;
                let total_width = 0;
                for (;;) {
                    if (
                        l + s > uni.range[1] ||
                        s * refine.factor > uni.spacing ||
                        total_width > uni.spacing
                    ) {
                        break;
                    }
                    lines.push(l + s);
                    l += s;
                    s *= refine.factor;
                    total_width += s;
                }
            }
        }
        if (refine.polar === "both" || refine.polar === "neg") {
            const uni = findUniformRefine(
                uniform_refine_no_overlap,
                refine.location,
                "neg",
            );
            if (uni) {
                let s = refine.value;
                let l = refine.location;
                let total_width = 0;
                for (;;) {
                    if (
                        l - s < uni.range[0] ||
                        s * refine.factor > uni.spacing ||
                        total_width > uni.spacing
                    ) {
                        break;
                    }
                    lines.push(l - s);
                    l -= s;
                    s *= refine.factor;
                    total_width += s;
                }
            }
        }
    }
    return lines;
};

// 添加这个线是为了让均匀细化的边界线清晰，如果不添加，atlas 会自动平滑不同的均匀细化区域边界
// 如果在将要添加的与边界之间已经定义其他线，则不插入边界线
const calculateUniformRefineBorderLine = (
    sorted_uniform_refine_no_overlap: UniformRefine[],
    existed_lines: number[],
): number[] => {
    const lines: number[] = [];
    const elines_sorted = [...existed_lines].sort((a, b) => a - b);
    for (let i = 0; i < sorted_uniform_refine_no_overlap.length; i++) {
        const refine = sorted_uniform_refine_no_overlap[i];

        lines.push(refine.range[0]);
        lines.push(refine.range[1]);

        if (refine.range[0] + refine.spacing < refine.range[1]) {
            let start_border_insert: boolean = true;
            for (const i of elines_sorted) {
                if (
                    i > refine.range[0] &&
                    i < refine.range[0] + refine.spacing
                ) {
                    start_border_insert = false;
                    break;
                }
            }
            if (start_border_insert) {
                lines.push(refine.range[0] + refine.spacing);
            }
            let end_border_insert: boolean = true;
            for (const i of elines_sorted) {
                if (
                    i > refine.range[1] - refine.spacing &&
                    i < refine.range[1]
                ) {
                    end_border_insert = false;
                    break;
                }
            }
            if (end_border_insert) {
                lines.push(refine.range[1] - refine.spacing);
            }
        }
    }
    return [...new Set(lines)].sort((a, b) => a - b);
};
