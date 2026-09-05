import React from 'react';
import Class5Section from './Class5Section';
import Class8Section from './Class8Section';
import Class10Section from './Class10Section';
import Class12Section from './Class12Section';

export default function CareerPathExplorer() {
    return (
        <div style={{ padding: '20px 0', maxWidth: 1000, margin: '0 auto' }}>
            <Class5Section />
            <div style={{ height: 1.5, background: 'var(--s-border)', margin: '50px 0' }} />
            <Class8Section />
            <div style={{ height: 1.5, background: 'var(--s-border)', margin: '50px 0' }} />
            <Class10Section />
            <div style={{ height: 1.5, background: 'var(--s-border)', margin: '50px 0' }} />
            <Class12Section />
        </div>
    );
}
