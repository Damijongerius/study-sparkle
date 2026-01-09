
import React from 'react';
import { BUILD_VERSION } from '../buildVersion';

type Props = { version?: string };

export default function VersionBadge({ version }: Props) {
    const ver = version ?? BUILD_VERSION;
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