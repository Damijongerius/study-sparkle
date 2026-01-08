import React from "react";

type Props = { version?: string };

function getEnvVersion(): string {
    return "V1.0.1";
}

export default function VersionBadge({ version }: Props) {
    const ver = version ?? getEnvVersion();
    return (
        <div className="fixed left-4 bottom-4 z-50 pointer-events-none">
            <div
                className="pointer-events-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-md shadow"
                aria-hidden
            >
                v{ver}
            </div>
        </div>
    );
}