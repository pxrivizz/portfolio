import { profile } from '../data/profile.ts'
import { experience } from '../data/experience.ts'
import { projects } from '../data/projects.ts'
export function AccessibleContent() {
  return <section id="portfolio-content" className="reading" aria-label="Portfolyo içeriği" tabIndex={-1}>
    <div className="reading-inner">
      <p className="reading-intro">{profile.name} / {profile.role}</p>
      <h2>Fikirlerden çalışan sistemlere.</h2><p className="summary">{profile.summary}</p>
      <section id="experience-content" tabIndex={-1} aria-labelledby="experience-heading">
        <h3 id="experience-heading">Deneyim</h3>
        {experience.map((entry) => <article key={entry.id} className="reading-entry">
          <p className="period">{entry.period}</p><div><h4>{entry.company}</h4><p>{entry.role}</p><p className="muted">{entry.description}</p></div>
        </article>)}
      </section>
      <section id="projects-content" tabIndex={-1} aria-labelledby="projects-heading">
        <h3 id="projects-heading">Seçili projeler</h3>
        {projects.map((project) => <article key={project.id} className="reading-entry">
          <p className="period">{project.technologies.join(' / ')}</p><div><h4><a href={project.href}>{project.title} <span aria-hidden="true">↗</span></a></h4><p className="muted">{project.description}</p></div>
        </article>)}
      </section>
      <footer className="reading-footer"><a href="#top">Başa dön</a><a href="/profile.html">Özgeçmiş</a><a href={profile.links[2].href}>İletişime geç</a></footer>
    </div>
  </section>
}
