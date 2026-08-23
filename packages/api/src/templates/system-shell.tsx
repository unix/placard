import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { cardStyle, px, TextBlock } from './shared.js'
import {
  SystemDescription,
  systemBrandTemplateFields,
  systemBrandText,
  systemFontFamily,
  SystemMeta,
  SystemTitle,
} from './system-shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

export const SystemShell = (input: RenderInput): ReactElement => {
  const brand = systemBrandText(input)

  return (
    <div
      style={{
        ...cardStyle,
        flexDirection: 'column',
        padding: px(54),
        backgroundColor: '#080a09',
        color: '#f1f3f2',
        fontFamily: systemFontFamily,
      }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {brand ? (
          <TextBlock color="#62e68a" fontFamily={systemFontFamily} fontSize={px(19)}>
            {brand}
          </TextBlock>
        ) : null}
        <TextBlock
          color="#758078"
          fontFamily={systemFontFamily}
          fontSize={px(19)}
          style={{ marginLeft: brand ? px(12) : 0 }}>
          ~/posts %
        </TextBlock>
        <TextBlock
          color="#e4e8e5"
          fontFamily={systemFontFamily}
          fontSize={px(19)}
          style={{ marginLeft: px(14) }}>
          ./og --print article.md
        </TextBlock>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBottom: px(20),
          paddingTop: px(34),
        }}>
        <SystemTitle
          color="#f1f3f2"
          input={input}
          sizes={{ large: 58, medium: 50, small: 40 }}
        />
        <div style={{ display: 'flex', marginTop: px(28) }}>
          <SystemDescription color="#b0b8b3" input={input} size={26} />
        </div>
        <div style={{ display: 'flex', marginTop: px(32) }}>
          <SystemMeta color="#858e88" input={input} size={20} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextBlock color="#758078" fontFamily={systemFontFamily} fontSize={px(19)}>
          ~/posts %
        </TextBlock>
        <div
          style={{
            display: 'flex',
            width: px(12),
            height: px(20),
            marginLeft: px(14),
            backgroundColor: '#dce2de',
          }}
        />
      </div>
    </div>
  )
}

export const meta = {
  id: 'system-shell',
  name: 'System Shell',
  description: 'Shell output interface with the article title as stdout.',
  fields: systemBrandTemplateFields,
} as const satisfies OgTemplateMeta

export const template = {
  ...meta,
  render: SystemShell,
} as const satisfies OgTemplate
