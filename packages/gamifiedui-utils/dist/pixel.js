export function painter(width = 32, height = 32) {
    const grid = Array.from({ length: height }, () => Array(width).fill(null));
    const px = (x, y, c) => {
        if (x >= 0 && y >= 0 && x < width && y < height)
            grid[y][x] = c;
    };
    const p = {
        grid,
        width,
        height,
        px,
        rect(x, y, w, h, c) {
            for (let j = y; j < y + h; j++)
                for (let i = x; i < x + w; i++)
                    px(i, j, c);
        },
        disc(cx, cy, r, c) {
            for (let j = -r; j <= r; j++)
                for (let i = -r; i <= r; i++)
                    if (i * i + j * j <= r * r + r * 0.6)
                        px(cx + i, cy + j, c);
        },
        ring(cx, cy, rx, ry, c) {
            for (let a = 0; a < 360; a += 4) {
                const rad = (a * Math.PI) / 180;
                px(Math.round(cx + Math.cos(rad) * rx), Math.round(cy + Math.sin(rad) * ry), c);
            }
        },
        over(x, y, w, h, c) {
            for (let j = y; j < y + h; j++)
                for (let i = x; i < x + w; i++)
                    if (grid[j]?.[i])
                        px(i, j, c);
        },
        rows(lines, x = 0, y = 0) {
            lines.forEach((line, j) => [...line].forEach((ch, i) => ch !== '.' && ch !== ' ' && px(x + i, y + j, ch)));
        },
        outline(c) {
            const filled = grid.map((row) => row.map(Boolean));
            const sides = [
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
            ];
            for (let y = 0; y < height; y++)
                for (let x = 0; x < width; x++)
                    if (!filled[y][x] && sides.some(([dx, dy]) => filled[y + dy]?.[x + dx]))
                        px(x, y, c);
        },
    };
    return p;
}
/** A grid as an SVG string; one rect per same-colour run keeps the markup small. */
export function gridSvg(grid, label = '', palette = {}) {
    const width = grid[0]?.length ?? 0;
    const rects = [];
    grid.forEach((row, y) => {
        let x = 0;
        while (x < width) {
            const c = row[x];
            let end = x + 1;
            while (end < width && row[end] === c)
                end++;
            if (c)
                rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${palette[c] ?? c}"/>`);
            x = end;
        }
    });
    const safe = label.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
    const a11y = label ? `role="img" aria-label="${safe}"` : 'aria-hidden="true"';
    return `<svg viewBox="0 0 ${width} ${grid.length}" shape-rendering="crispEdges" ${a11y}>${rects.join('')}</svg>`;
}
/** Mirror a grid left to right, for sprites facing the other way. */
export function mirrorGrid(grid) {
    return grid.map((row) => [...row].reverse());
}
