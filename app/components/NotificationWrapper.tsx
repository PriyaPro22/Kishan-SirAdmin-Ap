"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const FCMHandler = dynamic(() => import('./FCMHandler'), { ssr: false });

export default function NotificationWrapper() {
    return <FCMHandler />;
}
