# Contributing to DUDOXX AI Provider

We love your input! We want to make contributing to DUDOXX AI Provider as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** and ensure they follow our coding standards
4. **Add tests** if you've added code that should be tested
5. **Update documentation** if you've changed APIs or added features
6. **Ensure the test suite passes**: `npm test`
7. **Make sure your code lints**: `npm run lint`
8. **Submit a pull request**!

## 🛠️ Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/dudoxx-ai.git
cd dudoxx-ai

# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build the package
npm run build

# Run demos (optional)
npm run demo:generate
npm run demo:streaming
npm run demo:embed
```

### Testing

We use Vitest for testing with both Node.js and Edge runtime environments:

```bash
# Run all tests
npm test

# Run Node.js tests only
npm run test:node

# Run Edge runtime tests only
npm run test:edge

# Watch mode for development
npm run test:node:watch
```

### Code Quality

Before submitting a pull request, ensure your code meets our quality standards:

```bash
# Lint TypeScript files
npm run lint

# Type checking
npm run type-check

# Code formatting check
npm run prettier-check
```

## 📝 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Provide comprehensive type definitions
- Avoid `any` types when possible
- Use meaningful variable and function names
- Follow existing code patterns and conventions

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Follow ESLint configuration
- Write self-documenting code with clear comments when necessary

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(provider): add reasoning model support
fix(streaming): resolve token counting issue
docs(readme): update installation instructions
```

## 🐛 Bug Reports

We use GitHub Issues to track public bugs. Report a bug by [opening a new issue](https://github.com/Dudoxx/dudoxx-ai/issues/new).

**Great bug reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Install package with '...'
2. Create provider with '...'
3. Call method '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Code sample**
```typescript
// Your code example here
```

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 18.17.0]
- Package version: [e.g. 1.2.3]
- AI SDK version: [e.g. 4.0.28]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

We welcome feature requests! Please [open an issue](https://github.com/Dudoxx/dudoxx-ai/issues/new) with:

- **Clear title** describing the feature
- **Detailed description** of the proposed functionality
- **Use case examples** showing how it would be used
- **Potential implementation** ideas (optional)

## 🧪 Adding New Features

When adding new features:

1. **Check existing issues** to avoid duplication
2. **Open an issue first** to discuss the feature
3. **Follow the development process** outlined above
4. **Add comprehensive tests** covering the new functionality
5. **Update documentation** including README and type definitions
6. **Consider backward compatibility** and breaking changes

### Feature Areas

We're particularly interested in contributions to:

- **New LLM provider integrations**
- **Enhanced streaming capabilities**
- **Improved error handling**
- **Performance optimizations**
- **Developer experience improvements**
- **Documentation and examples**

## 📚 Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add more examples
- Improve API documentation
- Create tutorials or guides
- Translate documentation

## 🔒 Security

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead:

1. Email us at [contact@dudoxx.com](mailto:contact@dudoxx.com)
2. Include detailed steps to reproduce
3. Provide your contact information
4. Allow time for us to address the issue before public disclosure

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project. Feel free to contact the maintainers if that's a concern.

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct.

## 🙋‍♀️ Questions?

Don't hesitate to ask questions:

- 💬 **Community**: [Discord Community](https://discord.gg/dudoxx)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Dudoxx/dudoxx-ai/issues)
- 📧 **Email**: [contact@dudoxx.com](mailto:contact@dudoxx.com)

## 🎯 Good First Issues

Looking for a place to start? Check out issues labeled [`good first issue`](https://github.com/Dudoxx/dudoxx-ai/labels/good%20first%20issue) - these are great for newcomers to the project.

---

Thank you for contributing to DUDOXX AI Provider! 🚀

**Built with ❤️ by [Walid Boudabbous](https://github.com/Walid-Azur)**

[Acceleate.com](https://acceleate.com) | [DUDOXX.com](https://dudoxx.com)