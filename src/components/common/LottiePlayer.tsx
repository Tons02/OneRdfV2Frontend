import { Lottie } from 'lottie-react'

interface LottiePlayerProps {
  animationData: object
  loop?: boolean
  className?: string
}

export function LottiePlayer({
  animationData,
  loop = true,
  className,
}: LottiePlayerProps) {
  return (
    <Lottie src={animationData} autoplay loop={loop} className={className} />
  )
}
