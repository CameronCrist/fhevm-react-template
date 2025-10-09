# Contributing to Universal FHEVM SDK

Thank you for your interest in contributing to the Universal FHEVM SDK! We welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/fhevm-universal-sdk.git
   cd fhevm-universal-sdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the SDK**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📋 Development Workflow

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Test updates
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Describe your changes
   - Wait for review

## 🎯 Contribution Guidelines

### Code Style

- Use TypeScript for all code
- Follow ESLint and Prettier configurations
- Write self-documenting code with clear names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write unit tests for all new features
- Maintain or improve code coverage
- Test edge cases and error conditions
- Use descriptive test names

### Documentation

- Update README.md if adding features
- Add JSDoc comments to public functions
- Update API reference for new exports
- Include code examples in documentation

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
```
feat(sdk): add batch encryption function
fix(react): resolve useEncrypt hook memory leak
docs(readme): update installation instructions
test(client): add decryption error handling tests
```

## 🐛 Reporting Bugs

### Before Submitting

- Check existing issues to avoid duplicates
- Verify the bug in the latest version
- Collect relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Install SDK version X
2. Run code snippet
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Code snippet**
```typescript
// Minimal code to reproduce
```

**Environment**
- SDK version:
- Node.js version:
- Framework (React/Vue/etc):
- OS:

**Additional context**
Any other information about the problem.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

## 📦 Project Structure

```
fhevm-universal-sdk/
├── packages/
│   └── fhevm-sdk/          # Main SDK package
│       ├── src/
│       │   ├── index.ts    # Main exports
│       │   ├── client.ts   # Core client
│       │   ├── react.ts    # React hooks
│       │   ├── vue.ts      # Vue composables
│       │   └── utils.ts    # Utilities
│       └── tests/          # Unit tests
├── examples/               # Example applications
├── docs/                   # Documentation
└── .github/                # GitHub configs
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { createFhevmClient } from '../src/client';

describe('FhevmClient', () => {
  it('should initialize successfully', async () => {
    const client = createFhevmClient({ provider, chainId: 11155111 });
    await client.init();
    expect(client.isReady()).toBe(true);
  });
});
```

## 📝 Documentation

### Adding Documentation

- Update package README for SDK changes
- Add framework guides for new integrations
- Include code examples with every feature
- Keep API reference up to date

### Documentation Structure

```markdown
# Feature Name

Brief description of the feature.

## Usage

```typescript
// Code example
```

## Parameters

| Name | Type | Description |
|------|------|-------------|
| param1 | string | Description |

## Returns

Description of return value.

## Examples

Additional examples with different scenarios.
```

## 🎨 Code Review Process

### What We Look For

- ✅ Clean, readable code
- ✅ Proper TypeScript types
- ✅ Comprehensive tests
- ✅ Updated documentation
- ✅ No breaking changes (or justified)
- ✅ Follows existing patterns

### Review Timeline

- Initial response: Within 48 hours
- Full review: Within 1 week
- Merge: After approval and CI passing

## 🏆 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project README
- GitHub contributor graph

## 📞 Getting Help

- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions and ideas
- **Email**: sdk@example.com

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Standards

- Be respectful and inclusive
- Welcome newcomers
- Give constructive feedback
- Focus on collaboration
- Respect different viewpoints

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Any conduct inappropriate in a professional setting

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: conduct@example.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Universal FHEVM SDK! 🎉
