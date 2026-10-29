import { closestCenter, pointerWithin, type CollisionDetection } from '@dnd-kit/core'

export const emailCollisions: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  return hits.length
    ? [...hits].sort(
        (a, b) =>
          Number(args.droppableContainers.find((c) => c.id === b.id)?.data.current?.type === 'block') -
          Number(args.droppableContainers.find((c) => c.id === a.id)?.data.current?.type === 'block'),
      )
    : closestCenter({
        ...args,
        // Large containing columns must not intercept keyboard collisions with their children.
        droppableContainers: args.droppableContainers.filter(
          (c) => c.data.current?.type === 'block' || c.data.current?.blockCount === 0,
        ),
      })
}
