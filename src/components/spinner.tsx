export type Props = {
  active: boolean;
}

export default function Spinner(props: Props) {
  const classList = () => 'spinner' +
    (props.active ? ' spinner--active' : '');

  return (
    <div class={ classList() } role="progressbar" aria-busy={ props.active } />
  );
}
