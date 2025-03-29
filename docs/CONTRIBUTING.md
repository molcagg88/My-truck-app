# Contributing to My Truck App

## Introduction

Thank you for considering contributing to My Truck App! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Bugs are tracked as GitHub issues. Create an issue and provide the following information:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the bug
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed and why it's a problem
- Include screenshots if possible
- Include details about your environment (device, OS, app version)

### Suggesting Enhancements

Enhancement suggestions are also tracked as GitHub issues. When creating an enhancement suggestion, include:

- Use a clear and descriptive title
- Provide a detailed description of the suggested enhancement
- Explain why this enhancement would be useful to most users
- Include mockups or examples if applicable

### Pull Requests

- Fill in the required template
- Follow the coding style and conventions
- Include appropriate tests
- Update documentation as needed
- End all files with a newline

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio or Xcode for emulators

### Setup Steps

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Start the development server: `npm start`

## Coding Guidelines

### JavaScript/TypeScript Style Guide

- Use TypeScript for all new code
- Follow the ESLint configuration in the project
- Use functional components with hooks instead of class components
- Use async/await instead of promises where appropriate

### React Native Best Practices

- Use React Native's built-in components when possible
- Optimize performance by minimizing renders
- Use React.memo for pure functional components
- Avoid inline styles; use NativeWind classes instead

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Changes that don't affect code functionality
- refactor: Code changes that neither fix bugs nor add features
- perf: Performance improvements
- test: Adding or correcting tests
- chore: Changes to the build process or auxiliary tools

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- Write unit tests for utility functions
- Write component tests for UI components
- Write integration tests for complex workflows

## Documentation

- Update README.md with details of changes to the interface
- Update API documentation for any changed endpoints
- Update the CHANGELOG.md file

## Review Process

1. A maintainer will review your PR
2. They may request changes or improvements
3. Once approved, a maintainer will merge your PR
4. Your contribution will be part of the next release

## Community

- Join our Discord server for discussions
- Follow us on Twitter for updates
- Subscribe to our newsletter

Thank you for contributing to My Truck App!
