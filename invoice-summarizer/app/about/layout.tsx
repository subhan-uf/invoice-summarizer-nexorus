export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full">
      <div className="w-full max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}
