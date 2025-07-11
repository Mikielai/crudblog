interface ContainerProps {
  children: React.ReactNode;
}
export default function Container({ children }: ContainerProps) {
  return <div className="container mx-auto py-10 px-4 md:px-6">{children}</div>;
}