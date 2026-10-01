# @tongleen/tcad-atlas-str

用 TypeScript 以声明式 DSL 生成 [SILVACO Atlas](https://silvaco.com/) 的**器件结构脚本**。

本库专注于器件结构的描述——**网格（mesh）、区域（region）、电极（electrode）、掺杂（doping）与保存（save）**，并输出一段可直接交给 Atlas 运行的 `go atlas ... quit` 脚本文本。它**不**生成求解、物理模型、I-V 扫描等仿真命令。

## 特性

- **声明式 API**：`useAtlasStruct()` 创建上下文，逐步累积命令，最后 `generate()` 输出完整脚本。
- **智能网格生成**：区域/电极边界自动转为网格关键线；自动合并重叠的均匀细化区间；界面加密按几何级数展开为离散网格线。
- **类型安全的材料名**：内置 Atlas 全部材料（单质/二元/三元/四元半导体、绝缘体、导体、有机物）的联合类型，另有 `{ UserDefined }` 扩展口。
- **零第三方依赖**（`save()` 仅使用 Node 内置 `node:fs`），同时提供 ESM / CJS 与类型声明。

## 安装

```bash
npm install @tongleen/tcad-atlas-str
```

## 快速开始

```typescript
import { useAtlasStruct } from "@tongleen/tcad-atlas-str";

const { mesh, region, electrode, doping, buildMesh, generate, save } =
    useAtlasStruct();

// 1) 网格：均匀细化 + 界面加密
mesh.addUniformRefine("x", { range: [0, 1], spacing: 0.1 });
mesh.addUniformRefine("y", { range: [0, 1], spacing: 0.1 });
mesh.addInterfaceRefine("x", {
    location: 0,
    value: 0.01,
    factor: 1.4,
    polar: "both",
});

// 2) 区域 / 电极 / 掺杂
region.add({ x: [0, 1], y: [0, 1], num: 1, material: "Silicon" });
electrode.add({ x: [0, 1], y: [0.75, 1], name: "Base" });
doping.add({
    type: "n",
    concentration: 1e16,
    kind: "uniform",
    position: { material: "Silicon" },
});

// 3) 输出
buildMesh("structure.str"); // 在脚本内容中追加 Atlas 命令：save outf=structure.str master
const text = generate(); // 完整脚本文本（string）
save("device.in"); // 把脚本文本写入本地文件 device.in
console.log(text);
```

生成结果（节选）：

```text
go atlas
mesh
x.mesh location=0.0000 spacing=0.1000
x.mesh location=0.0100 spacing=0.1000
x.mesh location=0.0240 spacing=0.1000
...
x.mesh location=0.9000 spacing=0.1000
x.mesh location=1.0000 spacing=0.1000
y.mesh location=0.0000 spacing=0.1000
...
region num=1 material=Silicon x.min=0 x.max=1 y.min=0 y.max=1
electrode name=Base x.min=0 x.max=1 y.min=0.75 y.max=1
dop n.type uniform conc=10000000000000000 material=Silicon
save outf=structure.str master
quit
```

> `generate()` 只返回字符串，**不落盘、不执行仿真**。`save(filename)` 会把 `generate()` 的结果写入本地文件；`buildMesh(filename)` 只是在**脚本内容**中追加一条 Atlas 的 `save outf=<filename> master` 命令——二者用途不同，注意区分。

## API

`useAtlasStruct()` 返回：

```typescript
{
    mesh: {
        addCriticalLine(axis: "x" | "y", location: number): void;
        addUniformRefine(axis: "x" | "y", opts: { range: [number, number]; spacing: number }): void;
        addInterfaceRefine(
            axis: "x" | "y",
            opts: { location: number; value: number; factor: number; polar: "pos" | "neg" | "both" },
        ): void;
    };
    region: { add(r: Region): void };
    electrode: { add(e: Electrode): void };
    doping: { add(d: Doping): void };
    buildMesh(filename: string): void; // 在脚本中追加 Atlas 命令：save outf=<filename> master
    generate(): string; // 返回完整脚本文本
    save(filename: string): void; // 将脚本文本写入本地文件（node:fs）
}
```

### `mesh`

| 方法                                                           | 说明                                                                                                                               |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `addCriticalLine(axis, location)`                              | 手动在 `x` / `y` 轴上添加一条必须落在网格节点上的**关键线**。                                                                      |
| `addUniformRefine(axis, { range, spacing })`                   | 在 `range = [min, max]` 内以不大于 `spacing` 的间距均匀细化。**相邻不同 `spacing` 的细化区之间为锐利过渡**（自动插入边界线）。     |
| `addInterfaceRefine(axis, { location, value, factor, polar })` | 在 `location` 处按几何级数（首间距 `value`、公比 `factor`）向 `polar` 方向加密，靠近界面处最密。用于在粗细区域之间做**平滑过渡**。 |

### `region.add(r)`

```typescript
type Region = {
    num: number;
    material: Material; // 内置材料名，或 { UserDefined: "MyMaterial" }
    x?: [number, number]; // 顺序无关，内部取 min/max
    y?: [number, number];
    polarization?: { scale?: number; psp_scale?: number };
    FN_sis?: boolean;
    moleFraction?: { x: number } | { y: number };
};
```

### `electrode.add(e)`

```typescript
type Electrode = {
    name: string;
    x?: [number, number];
    y?: [number, number];
};
```

### `doping.add(d)`

```typescript
type DopingPosition =
    | { x: [number, number]; y: [number, number] }
    | { region: number }
    | { name: string }
    | { material: AtlasMaterial }; // 仅内置材料

type Doping = {
    kind: "uniform" | "gaussian";
    type: "n" | "p";
    concentration: number;
    position: DopingPosition;
    gaussian_params?: { x_char: number; y_char: number }; // gaussian 时必填
};
```

### `buildMesh(filename)`

在生成的脚本内容中追加一条 Atlas 命令 `save outf=<filename> master`（供 Atlas 保存结构数据）。

> **命名说明**：`buildMesh` 并不构建网格（网格由 `mesh.*` 管理），它只向**脚本内容**追加 Atlas 的 `save` 命令；命名沿用“构建/保存网格结构”的语义。它**不写本地文件**，要写脚本文件请用 `save(filename)`。

### `save(filename)`

把 `generate()` 生成的完整脚本文本写入本地文件（内部使用 `node:fs` 的 `writeFileSync`）。本方法**只写文件，不执行仿真**。

## 关键行为与约束

1. **区域/电极边界自动成为关键线。** `region.add` / `electrode.add` 会取 `x` / `y` 两端自动注册关键线，因此网格节点会精确落在器件边界上。
2. **不同 uniform refine 区域之间锐利过渡。** 生成网格时会在每个细化区边界处插入边界线（若该边界内侧的第一个 `spacing` 区间内已有其他网格线，则不重复插入），并让边界线取相邻区间中**较粗**的 `spacing`，从而避免 Atlas 自动在粗细交界处平滑过渡，使得间距变化更可控。
3. **需要平滑过渡时用界面加密。** 若希望粗细区域之间平滑过渡，请改用 `addInterfaceRefine`：它围绕 `location` 生成 `location ± value·factorⁿ` 系列几何级数加密线（靠近界面最密），直到间距超过该处均匀细化的 `spacing` 或超出细化区间。
4. **均匀细化必须覆盖整个定义域。** `generate()` 会校验：第一个 refine 左端 ≤ 最小关键线、相邻区间必须有重叠、最后一个 refine 右端 ≥ 最大关键线；否则抛出带具体数值的错误。
5. **每个用到的轴至少要有一条 uniform refine**，否则抛 `No uniform refine defined for x/y`。
6. **gaussian 掺杂必须提供 `gaussian_params`**，否则抛错。
7. **数值输出固定 4 位小数**：网格行形如 `x.mesh location=0.1000 spacing=0.0500`。

## 已知限制

- `save` 命令生成的是 `save outf=<file> master`，`master` 关键字请按实际 Atlas 版本核实。
- 自定义材料（`{ UserDefined }`）仅在 `region` 中受支持；`dop` 只接受内置材料，需要按自定义材料掺杂时请改用 `{ region }` 或 `{ name }`。
- `save(filename)` 依赖 Node 的 `node:fs`，因此**不适用于浏览器环境**。
- `generate()` 只输出字符串、`save()` 只写文件，二者都不执行仿真。

## 开发

```bash
npm run build      # tsup 构建到 dist/
npm run dev        # 监听模式
npm run typecheck  # tsc --noEmit
npm run format     # Biome 格式化
```

## 许可证

[Apache-2.0](./LICENSE)
