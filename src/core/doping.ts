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

import type { AtlasMaterial } from "../def/builtin_materials";

type DopingPosition =
    | {
          x: [number, number];
          y: [number, number];
      }
    | { region: number }
    | { name: string }
    | { material: AtlasMaterial };

type Doping = {
    kind: "uniform" | "gaussian";
    type: "n" | "p";
    concentration: number;
    position: DopingPosition;
    gaussian_params?: { x_char: number; y_char: number };
};

const doping = ({
    kind,
    type,
    concentration,
    position,
    gaussian_params,
}: Doping) => {
    const cmd_let: string[] = [
        "dop",
        `${type}.type`,
        kind,
        `conc=${concentration}`,
    ];
    if ("x" in position && "y" in position) {
        cmd_let.push(`x.min=${Math.min(...position.x)}`);
        cmd_let.push(`x.max=${Math.max(...position.x)}`);
        cmd_let.push(`y.min=${Math.min(...position.y)}`);
        cmd_let.push(`y.max=${Math.max(...position.y)}`);
    }
    if ("region" in position) {
        cmd_let.push(`region=${position.region}`);
    }
    if ("name" in position) {
        cmd_let.push(`name=${position.name}`);
    }
    if ("material" in position) {
        cmd_let.push(`material=${position.material}`);
    }
    if (kind === "gaussian" && gaussian_params === undefined) {
        throw new Error("gaussian_params is required for gaussian doping");
    }
    if (gaussian_params) {
        cmd_let.push(`x.char=${gaussian_params.x_char}`);
        cmd_let.push(`y.char=${gaussian_params.y_char}`);
    }
    return cmd_let.join(" ");
};

export default doping;
export type { Doping, DopingPosition };
