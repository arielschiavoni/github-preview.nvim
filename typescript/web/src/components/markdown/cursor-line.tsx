import { useContext, useEffect, useState } from "react";
import { websocketContext } from "../../websocket-context/context.ts";
import { scroll, type Offsets } from "../../websocket-context/scroll.ts";

export const CURSOR_LINE_ELEMENT_ID = "cursor-line-element-id";

type Props = {
    offsets: Offsets | null;
    cursorLineElement: HTMLElement | undefined;
    markdownContainerElement: HTMLElement | undefined;
};

export const CursorLine = ({ offsets, cursorLineElement, markdownContainerElement }: Props) => {
    const { registerHandler } = useContext(websocketContext);
    const [cursorLine, setCursorLine] = useState<number | null>(null);
    const [lineColor, setLineColor] = useState<string>();
    const [topOffsetPct, setTopOffsetPct] = useState<number | null>(null);

    useEffect(() => {
        registerHandler("cursor-line", (message) => {
            if (message.cursorLineColor) setLineColor(message.cursorLineColor);
            if (message.cursorLine !== undefined) setCursorLine(message.cursorLine);
            if (message.topOffsetPct !== undefined) setTopOffsetPct(message.topOffsetPct);
        });
    }, [registerHandler]);

    useEffect(() => {
        if (!cursorLineElement) return;

        if (cursorLine === null) {
            cursorLineElement.style.setProperty("visibility", "hidden");
            return;
        }

        if (!offsets || !markdownContainerElement) return;

        scroll(markdownContainerElement, topOffsetPct, offsets, cursorLine, cursorLineElement);
    }, [cursorLine, cursorLineElement, markdownContainerElement, offsets, topOffsetPct]);

    return (
        <div
            id={CURSOR_LINE_ELEMENT_ID}
            className="absolute pointer-events-none w-full h-[36px]"
            style={{ background: lineColor }}
        />
    );
};