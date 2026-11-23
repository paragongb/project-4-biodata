export default function SkillList({ items }: { items: string[] }) {
  return (
    <ul className="chips skill-list">
      {items.map((name) => <li key={name}>{name}</li>)}
    </ul>
  );
}
