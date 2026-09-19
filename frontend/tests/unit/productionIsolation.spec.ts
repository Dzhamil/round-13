import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const fixtureNames = /Тестов|Иванов|Яковлев|Борисов|Антонов|\b(?:alpha|zeta)\b|\+7999000000[123]/u;

function sourceFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? sourceFiles(file) : /\.(?:[cm]?[jt]sx?|java)$/.test(file) ? [file] : [];
    });
}

test("production sources contain no FIO sorting or completed profile fixture names", () => {
    const violations = ["frontend/src", "src/main/java"].flatMap(root =>
        sourceFiles(path.join(repositoryRoot, root)).filter(file => fixtureNames.test(readFileSync(file, "utf8")))
    );
    expect(violations.map(file => path.relative(repositoryRoot, file))).toEqual([]);
});

test("production frontend imports cannot point into test-only directories", () => {
    const violations: string[] = [];
    for (const file of sourceFiles(path.join(repositoryRoot, "frontend/src"))) {
        const { importedFiles } = ts.preProcessFile(readFileSync(file, "utf8"), true, true);
        for (const { fileName } of importedFiles) {
            const target = fileName.startsWith(".") ? path.resolve(path.dirname(file), fileName) : fileName;
            if (/(?:^|[/\\])(?:tests|e2e|fixtures|__tests__|__mocks__)(?:[/\\]|$)/.test(target)) {
                violations.push(`${path.relative(repositoryRoot, file)} -> ${fileName}`);
            }
        }
    }
    expect(violations).toEqual([]);
});
