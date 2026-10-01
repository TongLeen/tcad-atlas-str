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

export type AtlasSingleElementSemiconductor =
    "Diamond" | "Germanium" | "Polysilicon" | "Silicon";

export type AtlasBinaryCompoundSemiconductor =
    | "AlAs"
    | "AlN"
    | "AlP"
    | "AlSb"
    | "BeTe"
    | "CdS"
    | "CdSe"
    | "CdTe"
    | "GaAs"
    | "GaP"
    | "GaN"
    | "GaSb"
    | "HgS"
    | "HgSe"
    | "HgTe"
    | "IGZO"
    | "InAs"
    | "InN"
    | "InP"
    | "InSb"
    | "PbS"
    | "PbSe"
    | "PbTe"
    | "SiC-3C"
    | "SiC-4H"
    | "SiC-6H"
    | "ScN"
    | "SiGe"
    | "SnTe"
    | "ZnS"
    | "ZnSe"
    | "ZnO"
    | "ZnTe";

export type AtlasTernaryCompoundSemiconductor =
    | "AlAsSb"
    | "AlGaAs"
    | "AlGaP"
    | "AlGaN"
    | "AlGaSb"
    | "AlInN"
    | "AlPSb"
    | "AlPAs"
    | "CdZnTe"
    | "GaAsSb"
    | "GaAsP"
    | "GaSbAs"
    | "GaSbP"
    | "HgCdTe"
    | "InGaAs"
    | "InAlAs"
    | "InAsP"
    | "InAlP"
    | "InAlSb"
    | "InAsSb"
    | "InGaP"
    | "InGaN"
    | "InGaSb"
    | "InPSb"
    | "SiGeC";

export type AtlasQuaternaryCompoundSemiconductor =
    | "AlGaAsP"
    | "AlGaAsSb"
    | "AlGaNAs"
    | "AlGaNP"
    | "AlInNAs"
    | "AlInNP"
    | "CuInGaSe2"
    | "InAlAsSb"
    | "InAlAsP"
    | "InAlGaAs"
    | "InGaAsP"
    | "InAlGaN"
    | "InAlGaP"
    | "InGaNAs"
    | "InGaNP"
    | "InGaAsSb"
    | "InPAsSb";

export type AtlasInsulator =
    | "Air"
    | "Al2O3"
    | "Ambient"
    | "BPSG"
    | "BSG"
    | "HfO2"
    | "HfSiO4"
    | "La2O3"
    | "Nitride"
    | "Oxide"
    | "OxyNitride"
    | "Sapphire"
    | "Si3N4"
    | "SiO2"
    | "SiN"
    | "SnO2"
    | "Ta2O5"
    | "TiO"
    | "TiO2"
    | "Vacuum"
    | "ZrO2";

export type AtlasConductor =
    | "Aluminum"
    | "AlSi"
    | "AlSiCu"
    | "AlSiTi"
    | "Cobalt"
    | "Copper"
    | "CoSi"
    | "Conductor"
    | "Contact"
    | "GaSbTe"
    | "Gold"
    | "GST"
    | "In2O3"
    | "Iron"
    | "ITO"
    | "Lead"
    | "Molybdenum"
    | "MoSi"
    | "NiSi"
    | "Nickel"
    | "PaSi"
    | "Palladium"
    | "PCM"
    | "Platinum"
    | "Polysilicon"
    | "PtSi"
    | "Silver"
    | "Tantalum"
    | "TaSi"
    | "Tin"
    | "TiSi"
    | "Titanium"
    | "TiON"
    | "Ti"
    | "Tungsten"
    | "WSi"
    | "ZrSi";

export type AtlasOrganic =
    | "Alq3"
    | "BAlq"
    | "CBP"
    | "CuPc"
    | "IGZO"
    | "Irppy"
    | "NPB"
    | "NPD"
    | "Pentacene"
    | "PPV"
    | "Tetracene"
    | "TPD";

export type AtlasMaterial =
    | AtlasSingleElementSemiconductor
    | AtlasBinaryCompoundSemiconductor
    | AtlasTernaryCompoundSemiconductor
    | AtlasQuaternaryCompoundSemiconductor
    | AtlasInsulator
    | AtlasConductor
    | AtlasOrganic;

export type AtlasMaterialsByCategory = {
    singleElementSemiconductors: AtlasSingleElementSemiconductor[];
    binaryCompoundSemiconductors: AtlasBinaryCompoundSemiconductor[];
    ternaryCompoundSemiconductors: AtlasTernaryCompoundSemiconductor[];
    quaternaryCompoundSemiconductors: AtlasQuaternaryCompoundSemiconductor[];
    insulators: AtlasInsulator[];
    conductors: AtlasConductor[];
    organics: AtlasOrganic[];
};

export type Material = AtlasMaterial | { UserDefined: string };
