<script lang="ts">
    import type { BaseQuestion } from '../quiz';
    export let question: BaseQuestion;
    let feedback: Array<boolean | null> = [];
    let feedbackQuestion: BaseQuestion | undefined;

    $: if (feedbackQuestion !== question) {
        feedbackQuestion = question;
        feedback = [];
    }

    function handleChange(event: Event) {
        if (!question.options.immediateFeedback) {
            feedback = [];
            return;
        }

        const input = event.currentTarget as HTMLInputElement;
        const fieldset = input.closest('fieldset');
        if (!fieldset) {
            throw new Error('Quiz answer input is not inside a fieldset.');
        }
        question.selected = Array.from(
            fieldset.querySelectorAll<HTMLInputElement>('input:checked')
        ).map((input) => Number(input.value));
        question.isCorrect();
        feedback = question.answers.map((answer, i) => {
            if (feedback[i] !== null && feedback[i] !== undefined) {
                return feedback[i];
            }
            if (answer.correct) {
                return true;
            }
            return question.selected.includes(i) ? false : null;
        });
    }
</script>

<fieldset>
    {#if question.questionType === 'MultipleChoice'}
        {#each question.answers as answer, i}
            <label>
                <input
                    type="checkbox"
                    on:change="{handleChange}"
                    bind:group="{question.selected}"
                    value="{i}"
                />
                <span
                    class:correct-answer="{feedback[i] === true}"
                    class:wrong-answer="{feedback[i] === false}"
                    >{@html answer.html}</span
                >
            </label>
        {/each}
    {:else}
        {#each question.answers as answer, i}
            <label>
                <input
                    type="radio"
                    on:change="{handleChange}"
                    bind:group="{question.selected[0]}"
                    value="{i}"
                />
                <span
                    class:correct-answer="{feedback[i] === true}"
                    class:wrong-answer="{feedback[i] === false}"
                    >{@html answer.html}</span
                >
            </label>
        {/each}
    {/if}
</fieldset>

<style>
    :global(.correct-answer) {
        background-color: #d4edda !important;
        border-color: #28a745 !important;
        color: #155724 !important;
    }
    :global(.wrong-answer) {
        background-color: #f8d7da !important;
        border-color: #dc3545 !important;
        color: #721c24 !important;
    }

    fieldset {
        border: 0;
    }

    [type='checkbox'],
    [type='radio'] {
        position: absolute;
        opacity: 0;
    }

    [type='radio'] + span {
        border-radius: 0.5em;
    }

    [type='checkbox'] + span {
        border-radius: 2px;
    }

    [type='checkbox'] + span,
    [type='radio'] + span {
        transition-duration: 0.3s;
        background-color: var(--quizdown-color-secondary);
        color: var(--quizdown-color-text);
        display: block;
        padding: 0.5rem;
        margin: 5px;
        border: 3px solid transparent;
        cursor: pointer;
    }

    [type='checkbox']:hover + span,
    [type='checkbox']:focus + span,
    [type='radio']:hover + span,
    [type='radio']:focus + span {
        filter: brightness(0.9);
    }

    [type='checkbox']:checked + span,
    [type='radio']:checked + span {
        border: 3px solid var(--quizdown-color-primary);
    }

    [type='checkbox']:disabled + span,
    [type='radio']:disabled + span {
        cursor: default;
        opacity: 0.9;
    }
</style>
