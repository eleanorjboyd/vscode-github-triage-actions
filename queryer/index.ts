/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as core from '@actions/core'
import { context } from '@actions/github'
import { OctoKit } from '../api/octokit'
import { getRequiredInput, logErrorToIssue, logRateLimit } from '../utils/utils'

const token = getRequiredInput('token')

const main = async () => {
	const comment = context.payload.comment.body as string
	if (comment.indexOf('/query') !== 0) {
		return
	}
	const query = comment.substr(7)
	const octokit = new OctoKit(token, context.repo)
	for await (const pageData of octokit.query({ q: query })) {
		for (const issue of pageData) {
			console.log((await issue.getIssue()).title)
		}
	}
}

main()
	.then(() => logRateLimit(token))
	.catch(async (error) => {
		core.setFailed(error.message)
		await logErrorToIssue(error.message, true, token)
	})
