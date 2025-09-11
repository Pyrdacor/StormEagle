export interface Size {
    width: number;
    height: number;
}

export function ZeroSize(): Size {
    return { width: 0, height: 0 };
}

export function addSizes(a: Size, b: Size): Size {
    return {
        width: a.width + b.width,
        height: a.height + b.height
    };
}
