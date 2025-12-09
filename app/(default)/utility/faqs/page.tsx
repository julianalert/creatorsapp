export const metadata = {
  title: 'FAQs - Mosaic',
  description: 'Page description',
}

export default function Faqs() {
  return (
    <div className="relative bg-white dark:bg-gray-900 h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">👋 How we can help you today?</h1>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl">
          {/* FAQ Item */}
          <article className="py-4 border-b border-gray-200 dark:border-gray-700/60">
            <header className="flex items-start mb-2">
              <div className="mt-2 mr-3">
                <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path className="text-blue-300" d="M4 8H0v4.9c0 1 .7 1.9 1.7 2.1 1.2.2 2.3-.8 2.3-2V8z" />
                  <path className="text-blue-500" d="M15 1H7c-.6 0-1 .4-1 1v11c0 .7-.2 1.4-.6 2H13c1.7 0 3-1.3 3-3V2c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">How do I connect my social media accounts?</h3>
            </header>
            <div className="pl-7">
              <div className="mb-2">To connect your social media accounts, go to Settings → My accounts and click on the platform you want to connect (Instagram, TikTok, or YouTube). Follow the authentication process to grant access to your account. Once connected, your account will appear in your dashboard.</div>
            </div>
          </article>

          {/* FAQ Item */}
          <article className="py-4 border-b border-gray-200 dark:border-gray-700/60">
            <header className="flex items-start mb-2">
              <div className="mt-2 mr-3">
                <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path className="text-blue-300" d="M4 8H0v4.9c0 1 .7 1.9 1.7 2.1 1.2.2 2.3-.8 2.3-2V8z" />
                  <path className="text-blue-500" d="M15 1H7c-.6 0-1 .4-1 1v11c0 .7-.2 1.4-.6 2H13c1.7 0 3-1.3 3-3V2c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">Can I manage multiple accounts from different platforms?</h3>
            </header>
            <div className="pl-7">
              <div className="mb-2">Yes! You can connect and manage multiple accounts across Instagram, TikTok, and YouTube all from one dashboard. Each account will be displayed separately, and you can switch between them using the account switcher in the top navigation bar.</div>
            </div>
          </article>

          {/* FAQ Item */}
          <article className="py-4 border-b border-gray-200 dark:border-gray-700/60">
            <header className="flex items-start mb-2">
              <div className="mt-2 mr-3">
                <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path className="text-blue-300" d="M4 8H0v4.9c0 1 .7 1.9 1.7 2.1 1.2.2 2.3-.8 2.3-2V8z" />
                  <path className="text-blue-500" d="M15 1H7c-.6 0-1 .4-1 1v11c0 .7-.2 1.4-.6 2H13c1.7 0 3-1.3 3-3V2c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">How do I remove a connected account?</h3>
            </header>
            <div className="pl-7">
              <div className="mb-2">To remove a connected account, navigate to Settings → My accounts. Find the account you want to remove and click the "Remove" button. You'll be asked to confirm the action before the account is permanently disconnected from your dashboard.</div>
            </div>
          </article>

          {/* FAQ Item */}
          <article className="py-4 border-b border-gray-200 dark:border-gray-700/60">
            <header className="flex items-start mb-2">
              <div className="mt-2 mr-3">
                <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path className="text-blue-300" d="M4 8H0v4.9c0 1 .7 1.9 1.7 2.1 1.2.2 2.3-.8 2.3-2V8z" />
                  <path className="text-blue-500" d="M15 1H7c-.6 0-1 .4-1 1v11c0 .7-.2 1.4-.6 2H13c1.7 0 3-1.3 3-3V2c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">Is my account data secure?</h3>
            </header>
            <div className="pl-7">
              <div className="mb-2">Yes, we take security seriously. All your account data is encrypted and stored securely. We only access the information necessary to display your account details and never share your credentials with third parties. You can revoke access at any time through your account settings.</div>
            </div>
          </article>

          {/* FAQ Item */}
          <article className="py-4 border-b border-gray-200 dark:border-gray-700/60">
            <header className="flex items-start mb-2">
              <div className="mt-2 mr-3">
                <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path className="text-blue-300" d="M4 8H0v4.9c0 1 .7 1.9 1.7 2.1 1.2.2 2.3-.8 2.3-2V8z" />
                  <path className="text-blue-500" d="M15 1H7c-.6 0-1 .4-1 1v11c0 .7-.2 1.4-.6 2H13c1.7 0 3-1.3 3-3V2c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">Can I change my email or password?</h3>
            </header>
            <div className="pl-7">
              <div className="mb-2">To change your email address or password, please contact our support team. You can find the contact information in Settings → Share feedback. We'll help you update your account credentials securely.</div>
            </div>
          </article>

          {/* FAQ Item */}
          <article className="py-4 border-b border-gray-200 dark:border-gray-700/60">
            <header className="flex items-start mb-2">
              <div className="mt-2 mr-3">
                <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path className="text-blue-300" d="M4 8H0v4.9c0 1 .7 1.9 1.7 2.1 1.2.2 2.3-.8 2.3-2V8z" />
                  <path className="text-blue-500" d="M15 1H7c-.6 0-1 .4-1 1v11c0 .7-.2 1.4-.6 2H13c1.7 0 3-1.3 3-3V2c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">What happens if I disconnect my account?</h3>
            </header>
            <div className="pl-7">
              <div className="mb-2">When you disconnect an account, we immediately stop accessing that account's data. Your account information will be removed from your dashboard, but your social media account itself remains unchanged on the platform. You can reconnect it anytime by going through the connection process again.</div>
            </div>
          </article>

          {/* FAQ Item */}
          <article className="py-4 border-b border-gray-200 dark:border-gray-700/60">
            <header className="flex items-start mb-2">
              <div className="mt-2 mr-3">
                <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path className="text-blue-300" d="M4 8H0v4.9c0 1 .7 1.9 1.7 2.1 1.2.2 2.3-.8 2.3-2V8z" />
                  <path className="text-blue-500" d="M15 1H7c-.6 0-1 .4-1 1v11c0 .7-.2 1.4-.6 2H13c1.7 0 3-1.3 3-3V2c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">How do I switch between different accounts?</h3>
            </header>
            <div className="pl-7">
              <div className="mb-2">Use the account switcher dropdown in the top navigation bar to switch between your connected accounts. Click on the current account name/avatar to see all your connected accounts and select the one you want to view.</div>
            </div>
          </article>

          {/* FAQ Item */}
          <article className="py-4 border-b border-gray-200 dark:border-gray-700/60">
            <header className="flex items-start mb-2">
              <div className="mt-2 mr-3">
                <svg className="shrink-0 fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path className="text-blue-300" d="M4 8H0v4.9c0 1 .7 1.9 1.7 2.1 1.2.2 2.3-.8 2.3-2V8z" />
                  <path className="text-blue-500" d="M15 1H7c-.6 0-1 .4-1 1v11c0 .7-.2 1.4-.6 2H13c1.7 0 3-1.3 3-3V2c0-.6-.4-1-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl leading-snug text-gray-800 dark:text-gray-100 font-bold">Why isn't my account data showing up?</h3>
            </header>
            <div className="pl-7">
              <div className="mb-2">If your account data isn't showing, first verify that your account is properly connected in Settings → My accounts. If it's connected but data isn't loading, try disconnecting and reconnecting the account. If the issue persists, please reach out through Settings → Share feedback and we'll help troubleshoot.</div>
            </div>
          </article>

        </div>

      </div>
    </div>
  )
}

