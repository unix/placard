import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { cardStyle, px, TextBlock } from './shared.js'
import {
  SystemDescription,
  systemBrandTemplateFields,
  systemBrandText,
  systemCodeText,
  systemFontFamily,
  SystemMeta,
  SystemTitle,
} from './system-shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

export const SystemBios = (input: RenderInput): ReactElement => {
  const brand = systemBrandText(input)
  const label = brand ? `${systemCodeText(brand)} BIOS v2.4` : 'BIOS v2.4'

  return (
    <div
      style={{
        ...cardStyle,
        flexDirection: 'column',
        padding: `${px(38)}px ${px(48)}px ${px(52)}px`,
        backgroundColor: '#030303',
        color: '#f1f1ec',
        fontFamily: systemFontFamily,
      }}>
      <TextBlock
        color="#030303"
        fontFamily={systemFontFamily}
        fontSize={px(18)}
        fontWeight={600}
        style={{
          width: '100%',
          backgroundColor: '#d7d7d0',
          padding: `${px(10)}px ${px(14)}px`,
        }}>
        {label}
      </TextBlock>
      <TextBlock
        color="#a3a39e"
        fontFamily={systemFontFamily}
        fontSize={px(16)}
        style={{ marginTop: px(34) }}>
        POST: MEMORY OK / SVG FOUND / FONT READY
      </TextBlock>
      <TextBlock
        color="#e8c84c"
        fontFamily={systemFontFamily}
        fontSize={px(18)}
        style={{ marginTop: px(34) }}>
        Booting article...
      </TextBlock>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: px(16),
          paddingTop: px(20),
        }}>
        <SystemTitle
          color="#f1f1ec"
          input={input}
          sizes={{ large: 58, medium: 50, small: 40 }}
        />
        <div style={{ display: 'flex', marginTop: px(28) }}>
          <SystemDescription color="#a3a39e" input={input} size={23} />
        </div>
      </div>
      <SystemMeta color="#a8a8a2" input={input} size={20} />
    </div>
  )
}

export const systemBiosTemplateMeta = {
  id: 'system-bios',
  name: 'System BIOS',
  description: 'BIOS POST interface that boots directly into the article title.',
  fields: systemBrandTemplateFields,
} as const satisfies OgTemplateMeta

export const systemBiosTemplate = {
  ...systemBiosTemplateMeta,
  render: SystemBios,
} as const satisfies OgTemplate
