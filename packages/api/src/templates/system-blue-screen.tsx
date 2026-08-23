import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { cardStyle, px, TextBlock } from './shared.js'
import {
  systemBrandText,
  systemCodeText,
  systemFontFamily,
  systemMetaText,
  SystemTitle,
} from './system-shared.js'
import type { OgTemplate, OgTemplateMeta, TemplateField } from './types.js'

const systemBlueScreenTemplateFields = [
  'brandName',
  'title',
  'author',
  'date',
] as const satisfies readonly TemplateField[]

export const SystemBlueScreen = (input: RenderInput): ReactElement => {
  const brand = systemBrandText(input)
  const meta = systemMetaText(input)

  return (
    <div
      style={{
        ...cardStyle,
        flexDirection: 'column',
        padding: `${px(42)}px ${px(68)}px ${px(56)}px`,
        backgroundColor: '#071eaa',
        color: '#f4f4f4',
        fontFamily: systemFontFamily,
      }}>
      {brand ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TextBlock
            color="#071eaa"
            fontFamily={systemFontFamily}
            fontSize={px(18)}
            fontWeight={600}
            style={{
              backgroundColor: '#f4f4f4',
              padding: `${px(6)}px ${px(28)}px`,
            }}>
            {systemCodeText(brand)}
          </TextBlock>
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: brand ? px(30) : px(18),
          textAlign: 'center',
        }}>
        <SystemTitle
          color="#f4f4f4"
          input={input}
          sizes={{ large: 46, medium: 40, small: 34 }}
          textAlign="center"
          transform={systemCodeText}
          width={1064}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <TextBlock color="#f4f4f4" fontFamily={systemFontFamily} fontSize={px(17)}>
          Technical information:
        </TextBlock>
        <TextBlock
          color="#f4f4f4"
          fontFamily={systemFontFamily}
          fontSize={px(17)}
          style={{ marginTop: px(18) }}>
          *** STOP: 0x00000024 (0x4F47, 0x1200, 0x0675, 0x2026)
        </TextBlock>
        {meta ? (
          <TextBlock
            color="#f4f4f4"
            fontFamily={systemFontFamily}
            fontSize={px(17)}
            style={{ marginTop: px(18) }}>
            *** ARTICLE: {meta}
          </TextBlock>
        ) : null}
      </div>
    </div>
  )
}

export const systemBlueScreenTemplateMeta = {
  id: 'system-blue-screen',
  name: 'System Blue Screen',
  description: 'Classic stop-error interface with a code-form article title.',
  fields: systemBlueScreenTemplateFields,
} as const satisfies OgTemplateMeta

export const systemBlueScreenTemplate = {
  ...systemBlueScreenTemplateMeta,
  render: SystemBlueScreen,
} as const satisfies OgTemplate
