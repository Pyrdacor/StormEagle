const fs = require("fs");
const path = require("path");

const definitions = {
    p5: {
            file: "node_modules/p5/types/core/main.d.ts", // "node_modules/p5/types/p5.d.ts",
            search: /class p5 \{\n([ \t]*)constructor/,
            replace: "class p5 {\n{1}{PATCHES}\n\n{1}constructor",
            patchJoin: "\n{1}",
            patches: [
                "width: number;",
                "height: number;",
                "keyCode: number;",
                "loadSound(path: string | Request, successCallback: any, failureCallback: any): Promise<SoundFile>;",
            ],
        },
    "p5.Image": {
        file: "node_modules/p5/types/image/p5.Image.d.ts",
        search: /class Image \{\n([ \t]*)constructor/,
        replace: "class Image {\n{1}{PATCHES}\n\n{1}constructor",
        patchJoin: "\n{1}",
        patches: [
            "width: number;",
            "height: number;",
        ]
    }
};

for (const [name, {file, search, patchJoin, replace, patches}] of Object.entries(definitions)) {
    const filePath = path.resolve(__dirname, file);

    let content = fs.readFileSync(filePath, "utf-8");

    const replacer = (...groups) => {
        const groupReplace = (_, p1) => {
            const groupId = +p1;
            return groups[groupId];
        };
        let join = '';
        if (patchJoin != undefined) {
            join = patchJoin.replaceAll(/\{([0-9]+)\}/g, groupReplace);
        }
        const patchString = patches.join(join);
 
        return replace
            .replace("{PATCHES}", patchString)
            .replaceAll(/\{([0-9]+)\}/g, groupReplace);

    };

    content = content.replace(search, replacer);

    fs.writeFileSync(filePath, content, "utf-8");
}
