import { render, useWindowResize, Container } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { ResizeWindowHandler } from './types'
import MapComponent from './map'

import '!./styles.css'

function Plugin () {
  function onWindowResize(windowSize: { width: number; height: number }) {
    emit<ResizeWindowHandler>('RESIZE_WINDOW', windowSize)
  }
  useWindowResize(onWindowResize, {
    maxHeight: 820,
    maxWidth: 820,
    minHeight: 400,
    minWidth: 600,
    resizeBehaviorOnDoubleClick: 'minimize'
  })

  return (
    <Container space='medium'>
      <MapComponent />
    </Container>
  )
}

export default render(Plugin)
