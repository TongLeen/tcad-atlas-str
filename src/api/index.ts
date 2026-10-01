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

import { writeFileSync } from "node:fs";

import mesh from "./mesh";
import { region, electrode, doping, save as _save } from "../core";
import type { Region, Electrode, Doping } from "../core";

const useAtlasStruct = () => {
    const cmds: string[] = [];

    const {
        addCriticalLine,
        addUniformRefine,
        addInterfaceRefine,
        gen: genMesh,
    } = mesh();

    const addRegion = (r: Region) => {
        cmds.push(region(r));
        if (r.x) {
            addCriticalLine("x", r.x[0]);
            addCriticalLine("x", r.x[1]);
        }
        if (r.y) {
            addCriticalLine("y", r.y[0]);
            addCriticalLine("y", r.y[1]);
        }
    };

    const addElectrode = (e: Electrode) => {
        cmds.push(electrode(e));
        if (e.x) {
            addCriticalLine("x", e.x[0]);
            addCriticalLine("x", e.x[1]);
        }
        if (e.y) {
            addCriticalLine("y", e.y[0]);
            addCriticalLine("y", e.y[1]);
        }
    };

    const addDoping = (d: Doping) => {
        cmds.push(doping(d));
    };

    const buildMesh = (filename: string) => {
        cmds.push(_save(filename));
    };

    const generate = () => {
        return ["go atlas", ...genMesh(), ...cmds, "quit"].join("\n") + "\n";
    };

    const save = (filename: string) => {
        writeFileSync(filename, generate());
    };

    return {
        mesh: {
            addCriticalLine,
            addUniformRefine,
            addInterfaceRefine,
        },
        region: { add: addRegion },
        electrode: { add: addElectrode },
        doping: { add: addDoping },
        buildMesh,
        generate,
        save,
    };
};

export default useAtlasStruct;
