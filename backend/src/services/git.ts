import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config/environment';

const execAsync = promisify(exec);

export class GitService {
  private static sshKeyPath = path.join(process.cwd(), '.keys/ssh/id_rsa');
  private static sshPublicKeyPath = path.join(process.cwd(), '.keys/ssh/id_rsa.pub');

  // Initialize git repository for a project
  static async initRepository(projectPath: string, remoteUrl?: string): Promise<SimpleGit> {
    try {
      // Ensure directory exists
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }

      const git = simpleGit(projectPath);
      
      // Check if already a git repo
      const isRepo = await git.checkIsRepo();
      
      if (!isRepo) {
        await git.init();
        console.log(`✅ Initialized git repository at: ${projectPath}`);
        
        // Set up git config for this repo
        await git.addConfig('user.name', config.git.userName);
        await git.addConfig('user.email', config.git.userEmail);
        
        if (config.git.signingKey) {
          await git.addConfig('user.signingkey', config.git.signingKey);
          await git.addConfig('commit.gpgsign', 'true');
        }
        
        if (remoteUrl) {
          await git.addRemote('origin', remoteUrl);
          console.log(`✅ Added remote origin: ${remoteUrl}`);
        }
      }
      
      return git;
    } catch (error) {
      console.error('Failed to initialize git repository:', error);
      throw error;
    }
  }

  // Create a signed commit
  static async createSignedCommit(
    projectPath: string,
    message: string,
    files: string[]
  ): Promise<string> {
    try {
      const git = simpleGit(projectPath);
      
      // Add files
      for (const file of files) {
        await git.add(file);
      }
      
      // Create commit
      const commitResult = await git.commit(message);
      const commitHash = commitResult.commit;
      
      console.log(`✅ Created commit: ${commitHash}`);
      
      // If GPG signing is enabled, the commit should already be signed
      // due to the git config we set up
      
      return commitHash;
    } catch (error) {
      console.error('Failed to create commit:', error);
      throw error;
    }
  }

  // Push to remote repository
  static async pushToRemote(projectPath: string, remoteName = 'origin', branch = 'main'): Promise<void> {
    try {
      const git = simpleGit(projectPath);
      
      // Set up SSH key for this operation if available
      const env = { ...process.env };
      if (fs.existsSync(this.sshKeyPath)) {
        env.GIT_SSH_COMMAND = `ssh -i ${this.sshKeyPath} -o IdentitiesOnly=yes`;
      }
      
      await git.env(env).push(remoteName, branch);
      console.log(`✅ Pushed to ${remoteName}/${branch}`);
    } catch (error) {
      console.error('Failed to push to remote:', error);
      throw error;
    }
  }

  // Clone repository
  static async cloneRepository(url: string, localPath: string): Promise<SimpleGit> {
    try {
      // Set up SSH key for cloning if available
      const env = { ...process.env };
      if (fs.existsSync(this.sshKeyPath)) {
        env.GIT_SSH_COMMAND = `ssh -i ${this.sshKeyPath} -o IdentitiesOnly=yes`;
      }
      
      // Use simple-git to clone
      const git = simpleGit();
      await git.env(env).clone(url, localPath);
      
      console.log(`✅ Cloned repository to: ${localPath}`);
      
      // Return git instance for the cloned repo
      return simpleGit(localPath);
    } catch (error) {
      console.error('Failed to clone repository:', error);
      throw error;
    }
  }

  // Get repository status
  static async getStatus(projectPath: string): Promise<any> {
    try {
      const git = simpleGit(projectPath);
      return await git.status();
    } catch (error) {
      console.error('Failed to get git status:', error);
      throw error;
    }
  }

  // Get commit history
  static async getCommitHistory(projectPath: string, maxCount = 10): Promise<any> {
    try {
      const git = simpleGit(projectPath);
      return await git.log({ maxCount });
    } catch (error) {
      console.error('Failed to get commit history:', error);
      throw error;
    }
  }

  // Create and switch to new branch
  static async createBranch(projectPath: string, branchName: string): Promise<void> {
    try {
      const git = simpleGit(projectPath);
      await git.checkoutLocalBranch(branchName);
      console.log(`✅ Created and switched to branch: ${branchName}`);
    } catch (error) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  }

  // Check if repository is clean (no uncommitted changes)
  static async isClean(projectPath: string): Promise<boolean> {
    try {
      const status = await this.getStatus(projectPath);
      return status.files.length === 0;
    } catch (error) {
      console.error('Failed to check if repo is clean:', error);
      return false;
    }
  }
}
