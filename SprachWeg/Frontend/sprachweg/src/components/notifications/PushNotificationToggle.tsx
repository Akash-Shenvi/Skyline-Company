import React from 'react';
import { BellRing } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const PushNotificationToggle: React.FC = () => {
    const {
        pushSupported,
        pushEnabled,
        pushLoading,
        pushHelperText,
        enablePush,
        disablePush,
    } = useNotifications();

    const isDisabled = pushLoading || !pushSupported;

    return (
        <div className="mt-3 rounded-xl bg-brand-off-white px-3 py-3">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-brand-gold" />
                        <p className="text-sm font-medium text-brand-olive-dark">
                            Browser push notifications
                        </p>
                    </div>
                    <p className="mt-1 text-xs text-brand-olive">
                        {pushHelperText}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void (pushEnabled ? disablePush() : enablePush())}
                    disabled={isDisabled}
                    aria-label={pushEnabled ? 'Disable browser push notifications' : 'Enable browser push notifications'}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-white ${
                        pushEnabled ? 'bg-brand-gold' : 'bg-brand-olive-light'
                    } ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pushEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
        </div>
    );
};

export default PushNotificationToggle;
