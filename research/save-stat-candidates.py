"""Archive supplied literal data without importing or executing TypeScript.

Run manually when updating the supplied research files; never part of the app build.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SUPPLIED = Path('C:/Users/muhdh/OneDrive/Coding/fortunes-weave-planner-main/src/app/data')
CHECKED = '2026-10-12'

def numbers(text):
    return {key: int(value) for key, value in re.findall(r'(hp|str|mag|spd|dex|def|res|lck|cha)\s*:\s*(-?\d+)', text)}

def growth_rows(filename):
    text = (SUPPLIED / filename).read_text(encoding='utf-8')
    field = 'modifiers' if filename == 'classes.ts' else 'growths'
    key = 'growthModifiersPercentagePoints' if field == 'modifiers' else 'growthRatesPercent'
    return [{'name': name, key: numbers(values)} for name, values in
            re.findall(r"name:\s*'([^']+)'[\s\S]*?" + field + r":\s*\{([^}]+)\}", text)]

details = (SUPPLIED / 'character-details.ts').read_text(encoding='utf-8')
profiles = []
for match in re.finditer(r"^  (?:'([^']+)'|([A-Za-z][A-Za-z0-9]*)):\s*\{([\s\S]*?)(?=^  (?:'[^']+'|[A-Za-z][A-Za-z0-9]*):\s*\{|^\};)", details, re.M):
    name, body = match.group(1) or match.group(2), match.group(3)
    def array(field):
        found = re.search(field + r':\s*\[([^]]*)\]', body)
        return re.findall(r"'([^']+)'", found.group(1)) if found else None
    base = re.search(r'bases:\s*\{([^}]+)\}', body)
    start = re.search(r"startingClass:\s*'([^']+)'", body)
    profiles.append({'name': name, 'baseStats': numbers(base.group(1)) if base else None,
                     'startingClass': start.group(1) if start else None,
                     'joinLevel': None, 'route': None, 'chapter': None,
                     'classModifiersIncluded': None, 'startingRanks': None,
                     'preferredSkills': array('strengths'), 'nonIdealSkills': array('weaknesses'),
                     'verification': 'supplied-transcription; context incomplete; not verified in-game'})

archive = {'schemaVersion': 1, 'checkedOn': CHECKED,
           'purpose': 'Research archive only. Not imported by the tracker or used to initialize browser state.',
           'provenance': {'characterGrowths': {'file': 'characters.ts', 'claimedSource': 'KeenGamer growth-rate guide', 'status': 'supplied transcription; compare disputes in supplied-data-audit.json'},
                          'classGrowths': {'file': 'classes.ts', 'status': 'supplied transcription; compare disputes in supplied-data-audit.json'},
                          'characterProfiles': {'file': 'character-details.ts', 'claimedSource': 'https://fortunesweave.co.uk/characters', 'status': 'supplied transcription; missing recruitment context'}},
           'characterGrowths': growth_rows('characters.ts'), 'classGrowths': growth_rows('classes.ts'),
           'characterProfiles': profiles}
(ROOT / 'supplied-stat-candidates.json').write_text(json.dumps(archive, indent=2) + '\n', encoding='utf-8')
audit = ROOT.parent.parent / 'supplied-data-audit.json'
(ROOT / 'supplied-data-audit.json').write_text(audit.read_text(encoding='utf-8'), encoding='utf-8')
print(json.dumps({'characterGrowthRows': len(archive['characterGrowths']), 'classGrowthRows': len(archive['classGrowths']), 'profiles': len(profiles), 'baseStatRows': sum(p['baseStats'] is not None for p in profiles)}))
