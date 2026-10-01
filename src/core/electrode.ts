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

type Electrode = {
    name: string;
    x?: [number, number];
    y?: [number, number];
};
const electrode = ({ name, x, y }: Electrode) => {
    const cmd_let: string[] = ["electrode", `name=${name}`];
    if (x) {
        cmd_let.push(`x.min=${Math.min(...x)}`);
        cmd_let.push(`x.max=${Math.max(...x)}`);
    }
    if (y) {
        cmd_let.push(`y.min=${Math.min(...y)}`);
        cmd_let.push(`y.max=${Math.max(...y)}`);
    }
    return cmd_let.join(" ");
};

export default electrode;
export type { Electrode };
