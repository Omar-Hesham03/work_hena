import React, { useEffect, useRef } from 'react';

// Set REACT_APP_ADSENSE_CLIENT and REACT_APP_ADSENSE_SLOT in your .env when ready
const ADSENSE_CLIENT = process.env.REACT_APP_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXX';
const ADSENSE_SLOT = process.env.REACT_APP_ADSENSE_SLOT || 'XXXXXXXXXX';

function NativeAd() {
    const adRef = useRef(null);
    const initialized = useRef(false);

    useEffect(() => {
        // Don't run twice in React StrictMode
        if (initialized.current) return;
        initialized.current = true;

        try {
            if (window.adsbygoogle && adRef.current) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    // Show placeholder if publisher ID not set yet
    const isPlaceholder = ADSENSE_CLIENT === 'ca-pub-XXXXXXXXXX';

    if (isPlaceholder) {
        return (
            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center min-h-[300px]">
                <div className="text-center text-gray-400 dark:text-gray-500 p-6">
                    <div className="text-4xl mb-3">📢</div>
                    <p className="font-semibold text-sm">Ad Placeholder</p>
                    <p className="text-xs mt-1">Google AdSense will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg overflow-hidden min-h-[300px]">
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-format="fluid"
                data-ad-layout-key="-fb+5w+4e-db+86" // in-feed layout key
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={ADSENSE_SLOT}
            />
        </div>
    );
}

export default NativeAd;