import CustomHeader from '@/components/ui/custom-header'

export default function OutreachTemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Custom Header */}
      <CustomHeader />

      {/* Main Content */}
      <main className="grow">
        {children}
      </main>
    </div>
  )
}

