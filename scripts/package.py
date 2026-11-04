#!/usr/bin/env python3
"""Check and package a CSS theme using only the Python standard library."""

import argparse
import json
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
FILES = ('theme.css', 'manifest.json', 'logo.png', 'README.md')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('theme', help='directory name under themes/')
    parser.add_argument('--check', action='store_true', help='validate without writing a ZIP')
    args = parser.parse_args()
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', args.theme):
        parser.error('theme must be a lowercase directory name')
    directory = ROOT / 'themes' / args.theme
    try:
        payload = {name: (directory / name).read_bytes() for name in FILES}
        if any(not content.strip() for content in payload.values()):
            raise ValueError('package files must not be empty')
        manifest = json.loads(payload['manifest.json'])
        if not isinstance(manifest, dict):
            raise ValueError('manifest must be a JSON object')
        for field in ('id', 'name', 'author', 'repoUrl'):
            if not isinstance(manifest.get(field), str) or not manifest[field].strip():
                raise ValueError(f'manifest requires {field}')
        if not re.fullmatch(r'[A-Za-z0-9_-]+', manifest['id']):
            raise ValueError('invalid marketplace ID')
        if args.theme == 'cosmic' and manifest['id'] != 'cosmic-dark':
            raise ValueError('COSMIC must retain its existing marketplace ID cosmic-dark')
        if manifest.get('manifestVersion') != 1:
            raise ValueError('manifestVersion must be 1')
        modes = manifest.get('theme')
        if not isinstance(modes, list) or not modes or any(mode not in ('light', 'dark') for mode in modes):
            raise ValueError('theme must declare light, dark, or both')
        if type(manifest.get('enableOnMobile')) is not bool:
            raise ValueError('enableOnMobile must be a boolean')
        if manifest.get('requestNative') is not False or manifest.get('requiredScopes') != []:
            raise ValueError('CSS themes must not request native access or note permissions')
        version = manifest.get('version', {})
        if not isinstance(version, dict) or any(type(version.get(part)) is not int or version[part] < 0 for part in ('major', 'minor', 'patch')):
            raise ValueError('version requires nonnegative major, minor, and patch integers')
        if not payload['logo.png'].startswith(b'\x89PNG\r\n\x1a\n'):
            raise ValueError('logo.png must be a PNG')
        readme = payload['README.md'].decode('utf-8')
        for url in re.findall(r'!\[[^\]]*\]\(([^)]+)\)', readme):
            if not url.startswith('https://'):
                raise ValueError('marketplace images require absolute HTTPS URLs')
    except (OSError, ValueError, UnicodeError) as error:
        parser.error(str(error))

    release = '.'.join(str(version[part]) for part in ('major', 'minor', 'patch'))
    if args.check:
        print(f'Checked {args.theme} {release} (metadata and package files; no visual or network checks).')
        return
    output = ROOT / 'dist' / f'{args.theme}-{release}.zip'
    output.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(output, 'w') as archive:
        for name, content in payload.items():
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, content)
    print(output.relative_to(ROOT))


if __name__ == '__main__':
    main()
