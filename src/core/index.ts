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

import mesh from "./mesh";
import region from "./region";
import electrode from "./electrode";
import doping from "./doping";
import type { Region } from "./region";
import type { Electrode } from "./electrode";
import type { Doping, DopingPosition } from "./doping";

const save = (filename: string) => {
    return `save outf=${filename} master`;
};

export { mesh, region, electrode, doping, save };
export type { Region, Electrode, Doping, DopingPosition };
