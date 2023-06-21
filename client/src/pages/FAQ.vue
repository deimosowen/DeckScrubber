
<template>
    <div class="bg-gray-100 flex flex-col justify-center">
        <div class="relative max-w-5xl mx-auto">
            <div class="relative px-4 py-10 bg-white shadow rounded-3xl sm:p-10">
                <div class="mx-auto">
                    <div class="mb-8">
                        <h1 class="text-2xl font-semibold text-center">Frequently Asked Questions</h1>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold">What does the service do?</h2>
                        <p class="text-gray-600 mt-2">This service provides an interface for users to manage containers,
                            allowing them to start, stop, and remove containers with ease.</p>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold">What technologies are used in this service?</h2>
                        <p class="text-gray-600 mt-2">The service is built using Vue.js for the frontend, and it may use
                            various backend technologies such as Node.js. Additionally, it utilizes TailwindCSS for styling
                            and Docker for container management.</p>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold">How do I start a container?</h2>
                        <p class="text-gray-600 mt-2">Go to the Containers section, find the container you want to start,
                            and click the "Start" button.</p>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold">How do I stop a container?</h2>
                        <p class="text-gray-600 mt-2">Go to the Containers section, find the container you want to stop, and
                            click the "Stop" button.</p>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold">How do I remove a container?</h2>
                        <p class="text-gray-600 mt-2">Go to the Containers section, find the container you want to remove,
                            and click the "Remove" button. Note that this action is irreversible.</p>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold">I have suggestions or feedback. How can I get in touch with you?
                        </h2>
                        <p class="text-gray-600 mt-2">We appreciate your feedback and suggestions for improving the service.
                            Please use the GitHub button on our site to go to the repository page. There, you can leave your
                            questions and suggestions in the Issues section.</p>
                    </div>

                    <div class="mb-6">
                        <h2 class="text-xl font-semibold">I encountered a problem. How can I get help?</h2>
                        <p class="text-gray-600 mt-2">If you're experiencing issues with the service, please check this FAQ
                            section for possible solutions. If you cannot find an answer to your question, use the GitHub
                            button on our site to go to the repository, where you can leave a request for help in the Issues
                            section.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "FAQ",
};
</script>