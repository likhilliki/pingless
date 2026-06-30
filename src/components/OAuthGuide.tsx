import React from 'react';
import { ShieldCheck, ArrowRight, AlertTriangle, HelpCircle, ExternalLink, RefreshCw, X } from 'lucide-react';

interface OAuthGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeAccess?: () => void;
  isUpgrading?: boolean;
  errorType?: 'popup-closed' | 'insufficient-scopes' | 'blocked' | null;
}

export const OAuthGuide: React.FC<OAuthGuideProps> = ({
  isOpen,
  onClose,
  onUpgradeAccess,
  isUpgrading = false,
  errorType = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        id="oauth-guide-modal"
        className="w-full max-w-2xl bg-[#0d0d12]/95 border border-white/10 rounded-[28px] overflow-hidden shadow-[0_0_50px_rgba(147,51,234,0.15)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans tracking-tight">Google Verification & Integration Guide</h3>
              <p className="text-xs text-white/40">Securely sync Calendar & Gmail with Pingless</p>
            </div>
          </div>
          <button 
            id="oauth-guide-close"
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {errorType && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-400">
                  {errorType === 'popup-closed' && 'Authorization Interrupted'}
                  {errorType === 'insufficient-scopes' && 'Permissions Upgrade Required'}
                  {errorType === 'blocked' && 'Access Blocked Warning'}
                </h4>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  {errorType === 'popup-closed' && 'The Google sign-in window was closed before permissions were fully granted. To enable automatic scanning of your emails and calendars, please complete the login flow and allow the requested scopes.'}
                  {errorType === 'insufficient-scopes' && 'You logged in with a standard account. To use the calendar/email scan, we need to request read-only access to your calendar and email receipts.'}
                  {errorType === 'blocked' && 'Your account might not be configured as a test user, or the OAuth screen has not been published yet. Check the developer steps below to fix this.'}
                </p>
              </div>
            </div>
          )}

          {/* User Steps */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-purple-400 flex items-center gap-1.5">
              <span>01</span> How to Sign In Successfully (For Users)
            </h4>
            <div className="grid gap-3">
              <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-xs shrink-0 font-bold">1</div>
                <div>
                  <p className="text-sm font-bold text-white">Click "Advanced"</p>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                    When Google prompts you with the warning card <span className="text-purple-300 font-semibold">"Google hasn’t verified this app"</span>, locate and click the small <span className="text-white border-b border-white/30">Advanced</span> link at the bottom-left of the warning.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-xs shrink-0 font-bold">2</div>
                <div>
                  <p className="text-sm font-bold text-white">Select "Go to Pingless (unsafe)"</p>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                    At the bottom of the expanded section, click the link that says <span className="text-rose-400 font-semibold">"Go to Pingless (unsafe)"</span> (or your customized applet name).
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-xs shrink-0 font-bold">3</div>
                <div>
                  <p className="text-sm font-bold text-white">Check Permissions & Continue</p>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                    Tick the check boxes to authorize <span className="text-emerald-400">Google Calendar</span> and <span className="text-indigo-400">Gmail Access</span>, then click <span className="text-white font-semibold">Continue</span>. This is fully isolated to your private sandbox!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Steps */}
          <div className="border-t border-white/5 pt-6 space-y-3">
            <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-purple-400 flex items-center gap-1.5">
              <span>02</span> Production Level Setup (For Project Owners)
            </h4>
            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-4">
              <p className="text-xs text-white/70 leading-relaxed">
                By default, new Google Cloud OAuth integrations are in <strong>"Testing"</strong> mode, restricting access solely to registered test emails. To open login access to <strong>any Google Account instantly</strong>, apply these developer steps:
              </p>

              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-white/60 leading-relaxed">
                    <strong>Enable Production:</strong> Go to the <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline inline-flex items-center gap-0.5">Google Cloud Console OAuth Screen <ExternalLink className="w-3 h-3" /></a>, select your project, and click the <strong>"Publish App"</strong> button under Publishing Status. This immediately allows any external Google email to sign in!
                  </p>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-white/60 leading-relaxed">
                    <strong>Verify App (Optional):</strong> If you want the warning screen to disappear entirely, you can click the <strong>"Submit for Verification"</strong> button. Google will guide you through setting up a simple privacy policy to approve public branding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white/40 text-[11px] uppercase tracking-wider font-mono">
            <HelpCircle className="w-4 h-4 text-white/30" /> Need assist? Contact developer
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              id="oauth-guide-dismiss"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-full border border-white/10 transition-all uppercase tracking-wider cursor-pointer"
            >
              Dismiss
            </button>
            {onUpgradeAccess && (
              <button
                id="oauth-guide-upgrade"
                onClick={onUpgradeAccess}
                disabled={isUpgrading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold text-xs rounded-full shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
              >
                {isUpgrading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Authorizing...
                  </>
                ) : (
                  <>
                    Upgrade to Full Sync <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
