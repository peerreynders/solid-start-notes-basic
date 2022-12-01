import { mdToHtml } from '~/lib/md-to-html';

type Props = {
  text: string;
}

export default function TextWithMdClient(props: Props) {
  const html = () => props.text ? mdToHtml(props.text) : ''; 
  return (
    <div class="text-with-markdown" innerHTML={ html() } />
  );
}

