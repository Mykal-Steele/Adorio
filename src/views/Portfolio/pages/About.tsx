'use client';

import { Download } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { useResponsive } from '../hooks/useResponsive';
import { mono, sans, vietnam } from '../constants/fonts';
import { Breadcrumb, Badge, IDECard, PageHeader, SectionLabel } from '../shared';

const timelineStatusColors: Record<string, string> = {
  IN_PROGRESS: 'var(--ide-orange)',
  SHIPPED: 'var(--ide-accent)',
  MILESTONE: 'var(--ide-purple)',
  INIT: 'var(--ide-blue)',
};

export function About() {
  const { isMobile } = useResponsive();

  return (
    <div className="min-h-full">
      <Breadcrumb segments={['src', 'about_me.md']} language="Markdown" />

      <div
        className={isMobile ? 'px-4 py-6' : 'px-8 py-8'}
        style={{ maxWidth: 700, margin: '0 auto' }}
      >
        <PageHeader title="Oakar Oo — Full-Stack Developer" style={{ marginBottom: 20 }} />

        <div className="flex flex-wrap items-center gap-2 mb-10">
          <Badge
            color="var(--ide-orange)"
            bg="var(--ide-orange-a12)"
            borderColor="var(--ide-orange-a30)"
          >
            KMUTT — CS Year 2
          </Badge>
          <Badge
            color="var(--ide-accent)"
            bg="var(--ide-accent-a10)"
            borderColor="var(--ide-accent-a25)"
          >
            Open to Opportunities
          </Badge>
          <a
            href="/OakarResume.pdf"
            download="OakarResume.pdf"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            style={{
              fontSize: 9,
              fontFamily: sans,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--ide-accent-dark)',
              background: 'var(--ide-accent-light)',
              padding: '3px 10px',
              textDecoration: 'none',
            }}
          >
            <Download size={10} />
            Resume
          </a>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontSize: 14,
              fontFamily: vietnam,
              color: 'var(--ide-text-2)',
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            I study Computer Science at{' '}
            <span style={{ fontWeight: 700, color: 'var(--ide-orange)' }}>KMUTT, Bangkok</span>.
            Started coding in 2021 with TypeScript and React, mostly building Discord bots and small
            web apps.
          </div>
          <div
            style={{
              fontSize: 14,
              fontFamily: vietnam,
              color: 'var(--ide-text-2)',
              lineHeight: 1.7,
            }}
          >
            Now I mostly build CLI tools and full-stack apps. I use TypeScript with Hono and Bun for
            most things, and I'm picking up Go and Python on the side. I led a 50+ developer fintech
            integration project at university and placed 2nd in the KMUTT IOT Hackathon.
          </div>
        </div>

        <SectionLabel>Experience</SectionLabel>
        <div className="mb-12 flex flex-col gap-4">
          {portfolioData.experience.map((exp) => (
            <IDECard
              key={exp.org}
              className="p-5"
              bg="bg-3"
              style={{ boxShadow: 'inset 3px 0 0 var(--ide-accent)' }}
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontFamily: sans,
                      color: 'var(--ide-text-1)',
                      fontWeight: 700,
                    }}
                  >
                    {exp.role}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: sans,
                      color: 'var(--ide-accent)',
                      marginTop: 2,
                    }}
                  >
                    {exp.org}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: mono,
                    color: 'var(--ide-text-6)',
                    background: 'var(--ide-bg-2)',
                    border: '1px solid var(--ide-border)',
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {exp.period}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5 pl-1">
                {exp.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      style={{
                        color: 'var(--ide-accent)',
                        fontSize: 10,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      ▸
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: vietnam,
                        color: 'var(--ide-text-4)',
                        lineHeight: 1.6,
                      }}
                    >
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </IDECard>
          ))}
        </div>

        <SectionLabel>Tech Stack</SectionLabel>
        <div
          className="grid gap-4 mb-12"
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}
        >
          {portfolioData.stack.map((group) => (
            <IDECard key={group.category} className="p-4" bg="bg-3">
              <div
                style={{
                  fontSize: 8,
                  fontFamily: sans,
                  color: group.color,
                  letterSpacing: '0.12em',
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${group.color}22`,
                }}
              >
                {group.category}
              </div>
              {group.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 mb-1"
                  style={{ fontSize: 12, fontFamily: mono, color: 'var(--ide-text-4)' }}
                >
                  <span style={{ color: group.color, fontSize: 8 }}>▸</span>
                  {item}
                </div>
              ))}
            </IDECard>
          ))}
        </div>

        <div
          className="grid gap-4 mb-12"
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}
        >
          {[
            { label: 'Projects Shipped', value: '5' },
            { label: 'NPM Packages', value: '1' },
            { label: 'Community Roles', value: '2' },
          ].map((stat) => (
            <IDECard key={stat.label} className="p-4" bg="bg-3">
              <div
                style={{
                  fontSize: 8,
                  fontFamily: sans,
                  color: 'var(--ide-text-5)',
                  letterSpacing: '0.1em',
                  marginBottom: 6,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontFamily: sans,
                  fontWeight: 700,
                  color: 'var(--ide-accent-light)',
                }}
              >
                {stat.value}
              </div>
            </IDECard>
          ))}
        </div>

        <SectionLabel>Career Log</SectionLabel>
        <div className="mb-12">
          {portfolioData.timeline.map((item, i) => (
            <div
              key={item.year}
              className="flex items-start gap-4 mb-4"
              style={{
                paddingBottom: i < portfolioData.timeline.length - 1 ? 16 : 0,
                borderBottom:
                  i < portfolioData.timeline.length - 1
                    ? '1px solid var(--ide-border-subtle)'
                    : 'none',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontFamily: mono,
                  color: 'var(--ide-text-6)',
                  flexShrink: 0,
                  width: 36,
                }}
              >
                {item.year}
              </div>
              <div
                style={{
                  width: 1,
                  background: 'var(--ide-border)',
                  alignSelf: 'stretch',
                  flexShrink: 0,
                }}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    color={timelineStatusColors[item.status]}
                    style={{ fontSize: 8, padding: '1px 6px' }}
                  >
                    {item.status}
                  </Badge>
                  <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-7)' }}>
                    #{item.hash}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontFamily: sans, color: 'var(--ide-text-2)' }}>
                  {item.event}
                </div>
              </div>
            </div>
          ))}
        </div>

        <SectionLabel>Community</SectionLabel>
        <div
          className="grid gap-3 mb-16"
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}
        >
          {portfolioData.community.map((c) => (
            <IDECard
              key={c.short}
              className="p-4"
              bg="bg-3"
              style={{ boxShadow: `inset 3px 0 0 ${c.color}` }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontFamily: sans,
                  color: c.color,
                  letterSpacing: '0.1em',
                  marginBottom: 6,
                }}
              >
                {c.short}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontFamily: vietnam,
                  color: 'var(--ide-text-2)',
                  lineHeight: 1.5,
                }}
              >
                {c.name}
              </div>
            </IDECard>
          ))}
        </div>
      </div>
    </div>
  );
}
