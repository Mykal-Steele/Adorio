import HostingView from '@/views/Hosting';

export const metadata = {
  title: 'File Hosting',
  description: 'Upload a file up to 100 MB and get a link to it on Adorio.',
};

export default function HostingPage() {
  return <HostingView />;
}
