import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { cardStyle, px, TextBlock, titleText } from './shared.js'
import {
  SystemDescription,
  systemFontFamily,
  SystemMeta,
  systemTemplateFields,
  SystemTitle,
} from './system-shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

export const SystemKernelPanic = (input: RenderInput): ReactElement => {
  const title = titleText(input)

  return (
    <div
      style={{
        ...cardStyle,
        flexDirection: 'column',
        padding: px(52),
        backgroundColor: '#050505',
        color: '#f3f3f3',
        fontFamily: systemFontFamily,
      }}>
      <TextBlock color="#e7e7e7" fontFamily={systemFontFamily} fontSize={px(16)}>
        panic(cpu 0 caller 0xffffff8000420a17):
      </TextBlock>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          paddingBottom: px(18),
          paddingTop: px(46),
        }}>
        <SystemTitle
          color="#f3f3f3"
          input={{ ...input, title: `“${title}”` }}
          sizes={{ large: 54, medium: 46, small: 38 }}
        />
        <div style={{ display: 'flex', marginTop: px(30) }}>
          <SystemDescription color="#aaaaaa" input={input} size={23} />
        </div>
      </div>
      <TextBlock color="#767676" fontFamily={systemFontFamily} fontSize={px(16)}>
        0xffffffb09f4aba40 : 0xffffff8000520675 _write_svg + 0x42
      </TextBlock>
      <div style={{ display: 'flex', marginTop: px(24) }}>
        <SystemMeta color="#b7b7b7" input={input} size={18} />
      </div>
    </div>
  )
}

export const systemKernelPanicTemplateMeta = {
  id: 'system-kernel-panic',
  name: 'System Kernel Panic',
  description: 'Kernel panic output with the article title as the fatal message.',
  fields: systemTemplateFields,
} as const satisfies OgTemplateMeta

export const systemKernelPanicTemplate = {
  ...systemKernelPanicTemplateMeta,
  render: SystemKernelPanic,
} as const satisfies OgTemplate
