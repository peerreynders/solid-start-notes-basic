import { useTransition } from 'solid-js';
import { useNavigate } from 'solid-start';

import type { JSX } from 'solid-js';

type Props = {
  kind: 'edit' | 'new';
  href: string;
  children: JSX.Element;
}

export default function EditButton(props: Props) {
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();
  const navigateToEdit = () => navigate(props.href); 
  const editNote = (e: Event) => {
    e.stopPropagation();
    startTransition(navigateToEdit);
  };
  const classButton = () => `edit-button` +
    (props.kind === 'edit' ? ' edit-button--edit' : ' edit-button--new');

  return (
    <button
      class={ classButton() }
      onClick={ editNote }
      disabled={ pending() }
    >
      { props.children }
    </button>
  );
}
