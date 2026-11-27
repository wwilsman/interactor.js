# Publishing releases

The release workflow publishes the exact Git tag attached to a published GitHub
release. It does not bump versions, push commits, or move existing tags.

Before creating a release, update `package.json` and `package-lock.json` to the
new version in a pull request. After merging it, publish a GitHub release whose
tag matches that version, such as `v3.6.3` for package version `3.6.3`.

The workflow stops if the tag and package version disagree or npm already has
that version. Versions `3.6.1` and `3.6.2` are already published and cannot be
reused. Stable releases use npm's `latest` tag; GitHub prereleases use `next`.

## One-time npm setup

A package maintainer must configure a trusted publisher for `interactor.js` in
the package's npm settings:

| Setting | Value |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | `wwilsman` |
| Repository | `interactor.js` |
| Workflow filename | `release.yml` |
| Environment | Leave empty |
| Allowed action | Direct publishing with `npm publish` |

With npm 11.15+ and an authenticated maintainer account with 2FA enabled, the
equivalent command is:

```sh
npm trust github interactor.js --repo wwilsman/interactor.js --file release.yml --allow-publish
```

If a publisher already exists, inspect it with `npm trust list interactor.js`
and make sure these settings match. GitHub collaborator access does not grant
npm package maintainer access.

The workflow uses GitHub's short-lived OIDC credentials and does not need an
`NPM_TOKEN` secret. After the first successful trusted publish, revoke the old
npm token and remove the unused GitHub `NPM_TOKEN` secret.

See [npm's trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/)
for the account setup and supported authentication methods.
