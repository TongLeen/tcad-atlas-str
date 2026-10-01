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

import type { Material } from "../def/builtin_materials";

type Region = {
    num: number;
    material: Material;
    x?: [number, number];
    y?: [number, number];
    polarization?: {
        scale?: number;
        psp_scale?: number;
    };
    FN_sis?: boolean;
    moleFraction?: { x: number } | { y: number };
};

const region = ({
    num,
    material,
    x,
    y,
    polarization,
    FN_sis,
    moleFraction,
}: Region) => {
    const cmd_let: string[] = ["region", `num=${num}`];
    if (typeof material === "object" && "UserDefined" in material) {
        cmd_let.push(`user.material=${material.UserDefined}`);
    } else {
        cmd_let.push(`material=${material}`);
    }
    if (x) {
        cmd_let.push(`x.min=${Math.min(...x)}`);
        cmd_let.push(`x.max=${Math.max(...x)}`);
    }
    if (y) {
        cmd_let.push(`y.min=${Math.min(...y)}`);
        cmd_let.push(`y.max=${Math.max(...y)}`);
    }
    if (polarization) {
        cmd_let.push("polarization");
        if (polarization.scale !== undefined)
            cmd_let.push(`polar.scale=${polarization.scale}`);
        if (polarization.psp_scale !== undefined)
            cmd_let.push(`psp.scale=${polarization.psp_scale}`);
    }
    if (FN_sis) {
        cmd_let.push(`fn.sis`);
    }
    if (moleFraction) {
        if ("x" in moleFraction && "y" in moleFraction)
            throw new Error("moleFraction cannot have both x and y");
        else if ("x" in moleFraction) cmd_let.push(`x.mole=${moleFraction.x}`);
        else if ("y" in moleFraction) cmd_let.push(`y.mole=${moleFraction.y}`);
    }
    return cmd_let.join(" ");
};

export default region;
export type { Region };
