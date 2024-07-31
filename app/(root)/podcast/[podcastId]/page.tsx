import React from 'react'

const PdocastDetails = ({ params }:{ params: { podcastId: string } }) => {
  return (
    <div className="text-white-1">PdocastDetails for { params.podcastId }</div>
  )
}

export default PdocastDetails