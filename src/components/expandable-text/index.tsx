/* eslint-disable max-len */
import { FC, useState, Fragment } from 'react'

import s from './expandable-text.module.scss'

interface ExpandableTextProps {
    text: string
    className?: string
}

export const ExpandableText: FC<ExpandableTextProps> = ({ text, className }) => {
    const [ expanded, setExpanded ] = useState<boolean>(false)

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    const renderParagraphs = (content: string) => {
        const paragraphs = content.split('\n\n')

        return paragraphs.map((paragraph, index) => (
            <p key={index} className={`mb-4 ${expanded || index < 2 ? 'block' : 'hidden'}`}>
                {paragraph.split('\n').map((line, i) => (
                    <Fragment key={i}>
                        {line}
                        <br />
                    </Fragment>
                ))}
            </p>
        ))
    }

    const truncatedText = text.length > 260 ? text.substring(0, 260) + '...' : text

    return (
        <div className={`relative ${className}`}>
            {renderParagraphs(expanded ? text : truncatedText)}
            {text.length > 260 && (
                <button
                    onClick={toggleExpanded}
                    className={`${s.expandButton} ${expanded ? s.expanded : s.collapsed}`}
                >
                    {expanded ? 'Hide' : 'Show'}
                </button>
            )}
        </div>
    )
}
