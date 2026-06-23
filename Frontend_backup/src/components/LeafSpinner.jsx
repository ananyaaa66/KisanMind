import { Sprout } from 'lucide-react'
// Signature loader: a rotating leaf/sprout
export default function LeafSpinner({ size = 28 }) {
  return (
    <span className="inline-flex animate-spinleaf text-cropbright" style={{ width: size, height: size }}>
      <Sprout size={size} />
    </span>
  )
}
