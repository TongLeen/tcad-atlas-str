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

const mesh = () => {
    let mesh_cmds: string[] = [];

    const x_mesh = (location: number, spacing: number) => {
        mesh_cmds.push(
            `x.mesh location=${location.toFixed(4)} spacing=${spacing.toFixed(4)}`,
        );
    };

    const y_mesh = (location: number, spacing: number) => {
        mesh_cmds.push(
            `y.mesh location=${location.toFixed(4)} spacing=${spacing.toFixed(4)}`,
        );
    };

    const gen = () => {
        return ["mesh", ...mesh_cmds];
    };

    return {
        x: x_mesh,
        y: y_mesh,
        gen,
    };
};

export default mesh;
