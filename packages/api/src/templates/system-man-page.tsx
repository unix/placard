import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { cardStyle, descriptionText, px, TextBlock } from './shared.js'
import {
  systemBrandTemplateFields,
  systemBrandText,
  systemFontFamily,
  SystemMeta,
  SystemTitle,
  SystemDescription,
} from './system-shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

export const SystemManPage = (input: RenderInput): ReactElement => {
  const brand = systemBrandText(input)
  const description = descriptionText(input)

  return (
    <div
      style={{
        ...cardStyle,
        flexDirection: 'column',
        backgroundColor: '#e9e8e2',
        color: '#151515',
        fontFamily: systemFontFamily,
      }}>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          padding: `${px(42)}px ${px(48)}px ${px(28)}px`,
        }}>
        <div
          style={{ display: 'flex', minHeight: px(18), justifyContent: 'center' }}>
          {brand ? (
            <TextBlock
              color="#151515"
              fontFamily={systemFontFamily}
              fontSize={px(15)}>
              {brand}
            </TextBlock>
          ) : null}
        </div>
        <TextBlock
          color="#151515"
          fontFamily={systemFontFamily}
          fontSize={px(18)}
          fontWeight={600}
          style={{ marginTop: px(40) }}>
          NAME
        </TextBlock>
        <div style={{ display: 'flex', marginLeft: px(34), marginTop: px(24) }}>
          <SystemTitle
            color="#151515"
            input={input}
            sizes={{ large: 48, medium: 42, small: 34 }}
            width={1024}
          />
        </div>
        {description ? (
          <div
            style={{ display: 'flex', flexDirection: 'column', marginTop: px(34) }}>
            <TextBlock
              color="#151515"
              fontFamily={systemFontFamily}
              fontSize={px(18)}
              fontWeight={600}>
              DESCRIPTION
            </TextBlock>
            <div style={{ display: 'flex', marginLeft: px(34), marginTop: px(18) }}>
              <SystemDescription
                color="#151515"
                input={input}
                size={20}
                width={1000}
              />
            </div>
          </div>
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <TextBlock
            color="#151515"
            fontFamily={systemFontFamily}
            fontSize={px(18)}
            fontWeight={600}>
            METADATA
          </TextBlock>
          <div style={{ display: 'flex', marginLeft: px(34), marginTop: px(18) }}>
            <SystemMeta color="#151515" input={input} size={17} />
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          height: px(42),
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: '#151515',
          paddingLeft: px(18),
          paddingRight: px(18),
        }}>
        <TextBlock color="#e9e8e2" fontFamily={systemFontFamily} fontSize={px(15)}>
          Manual page og(7) line 1/24 (END)
        </TextBlock>
        <TextBlock color="#e9e8e2" fontFamily={systemFontFamily} fontSize={px(15)}>
          q: quit
        </TextBlock>
      </div>
    </div>
  )
}

export const systemManPageTemplateMeta = {
  id: 'system-man-page',
  name: 'System Man Page',
  description: 'Unix manual page with the article title as its name entry.',
  fields: systemBrandTemplateFields,
} as const satisfies OgTemplateMeta

export const systemManPageTemplate = {
  ...systemManPageTemplateMeta,
  render: SystemManPage,
} as const satisfies OgTemplate
