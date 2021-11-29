import React from 'react'

export interface ImageHandleProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  className?: string
}

export const ImageHandle = (props: ImageHandleProps) => <div {...props} />
