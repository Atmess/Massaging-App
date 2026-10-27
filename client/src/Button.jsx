export default function Appbutton() {
  return (
    <div>
      <Button text="Click Me!" color="blue" fontSize={12} />
      <Button text="Don't Click Me!" color="red" fontSize={12} />
      <Button text="Click Me!" color="blue" fontSize={20} />
    </div>
  );
}

function Button({ text, color, fontSize }) {
  const ButtonStyle = {
    color: color,
    fontSize: fontSize + 'px',
  };
  return <button style={ButtonStyle}>{text}</button>;
}
